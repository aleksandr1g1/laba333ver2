const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { writePool, readPool, initDatabases } = require('./db/init');
const config = require('./config');
const { authenticateToken } = require('./middleware/auth');
const { connectKafka, disconnectKafka, sendMessage } = require('./kafka');
const { startKafkaConsumer } = require('./kafka-consumer');
const { Pool } = require('pg');
let { Kafka } = require('kafkajs');
const kafkaEmulator = require('./kafka/emulator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3002;
const ENABLE_KAFKA = process.env.ENABLE_KAFKA !== 'false'; // По умолчанию включена, отключается явным флагом

// Глобальные переменные для Kafka
let kafka = null;
let producer = null;
let consumer = null;
let admin = null;

// Middleware
app.use(cors());
app.use(express.json());

// Отказоустойчивая отправка сообщений в Kafka
const safeSendMessage = async (topic, key, value) => {
  if (ENABLE_KAFKA && producer) {
    try {
      console.log(`Отправка сообщения в Kafka (тема: ${topic}, ключ: ${key})`);
      await producer.send({
        topic,
        messages: [{ key, value: JSON.stringify(value) }]
      });
      console.log(`Сообщение успешно отправлено в Kafka (тема: ${topic}, ключ: ${key})`);
      return true;
    } catch (error) {
      console.error(`Ошибка при отправке сообщения в Kafka: ${error.message}`);
      return false;
    }
  } else {
    console.log(`Kafka недоступна или отключена, сообщение не отправлено (тема: ${topic}, ключ: ${key})`);
    return false;
  }
};

// Добавляем функцию safeSendMessage к объекту запроса
app.use((req, res, next) => {
  req.safeSendMessage = safeSendMessage;
  next();
});

// Проверка подключения к базам данных
const checkDatabaseConnections = async () => {
  try {
    await readPool.query('SELECT NOW()');
    await writePool.query('SELECT NOW()');
    console.log('Подключение к базам данных успешно установлено');
    return true;
  } catch (error) {
    console.error('Ошибка подключения к базам данных:', error);
    throw error;
  }
};

// Проверка и создание базы данных
const createDatabaseIfNotExists = async () => {
  try {
    // Проверяем существование баз данных, но не создаем new ones
    const dbWriteCheckResult = await writePool.query(`
      SELECT 1 FROM pg_database WHERE datname = 'health_tracker_write'
    `);
    
    const dbReadCheckResult = await writePool.query(`
      SELECT 1 FROM pg_database WHERE datname = 'health_tracker_read'
    `);
    
    if (dbWriteCheckResult.rows.length > 0) {
      console.log('База данных health_tracker_write уже существует');
    } else {
      console.error('База данных health_tracker_write не существует, пожалуйста создайте её');
      throw new Error('База данных health_tracker_write не существует');
    }
    
    if (dbReadCheckResult.rows.length > 0) {
      console.log('База данных health_tracker_read уже существует');
    } else {
      console.error('База данных health_tracker_read не существует, пожалуйста создайте её');
      throw new Error('База данных health_tracker_read не существует');
    }
    
    console.log('Проверка существования баз данных завершена успешно');
    return true;
  } catch (error) {
    console.error('Ошибка при проверке/создании базы данных:', error);
    throw error;
  }
};

// Создание необходимых таблиц
const createTablesIfNotExist = async () => {
  try {
    // Проверяем существование таблиц
    const tablesCheckResult = await writePool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'sleep_records', 'nutrition_records', 'activity_records', 'wellbeing_records')
    `);
    
    if (tablesCheckResult.rows.length < 5) {
      console.log('Создаем необходимые таблицы...');
      
      // Таблица пользователей
      await writePool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Таблица записей о сне
      await writePool.query(`
        CREATE TABLE IF NOT EXISTS sleep_records (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          start_time TIMESTAMP WITH TIME ZONE NOT NULL,
          end_time TIMESTAMP WITH TIME ZONE NOT NULL,
          quality INTEGER CHECK (quality BETWEEN 1 AND 10),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Таблица записей о питании
      await writePool.query(`
        CREATE TABLE IF NOT EXISTS nutrition_records (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          date DATE NOT NULL,
          food TEXT,
          calories INTEGER,
          protein NUMERIC,
          carbs NUMERIC,
          fats NUMERIC,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Таблица записей об активности
      await writePool.query(`
        CREATE TABLE IF NOT EXISTS activity_records (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          date DATE NOT NULL,
          type VARCHAR(255),
          duration INTEGER,
          calories_burned INTEGER,
          distance NUMERIC,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Таблица записей о самочувствии
      await writePool.query(`
        CREATE TABLE IF NOT EXISTS wellbeing_records (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id),
          date DATE NOT NULL,
          mood INTEGER CHECK (mood BETWEEN 1 AND 10),
          sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 10),
          energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
          stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 10),
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('Таблицы успешно созданы');
    } else {
      console.log('Таблицы уже существуют, пропускаем инициализацию');
    }
    
    return true;
  } catch (error) {
    console.error('Ошибка при создании таблиц:', error);
    throw error;
  }
};

// Инициализация баз данных и Kafka
const init = async () => {
  try {
    // Подключение к базам данных
    await checkDatabaseConnections();
    
    // Проверяем существование базы данных и создаем ее при необходимости
    await createDatabaseIfNotExists();
    
    // Создаем таблицы если они не существуют
    await createTablesIfNotExist();
    
    // Инициализация Kafka
    if (ENABLE_KAFKA) {
      try {
        kafka = new Kafka({
          clientId: 'health-tracker',
          brokers: ['localhost:9092'],
          retry: {
            initialRetryTime: 300,
            retries: 10
          }
        });
        
        // Создаем админ-клиент
        admin = kafka.admin();
        await admin.connect();
        console.log('Подключение к Kafka Admin API успешно установлено');
        
        // Проверяем существующие топики
        const topics = await admin.listTopics();
        console.log('Доступные топики Kafka:', topics);
        
        // Создаем продюсера
        producer = kafka.producer();
        await producer.connect();
        console.log('Подключение к Kafka Producer API успешно установлено');
        
        // Создаем консьюмера
        consumer = kafka.consumer({ groupId: 'health-tracker-group' });
        await consumer.connect();
        console.log('Подключение к Kafka Consumer API успешно установлено');
        
        // Подписываемся на топики
        await consumer.subscribe({ topics: [
          'sleep-records', 
          'nutrition-records', 
          'activity-records', 
          'wellbeing-records'
        ]});
        console.log('Подписка на топики Kafka успешно настроена');
        
        // Запускаем слушателя сообщений
        await consumer.run({
          eachMessage: async ({ topic, partition, message }) => {
            console.log({
              topic,
              partition,
              offset: message.offset,
              value: message.value.toString(),
            });
          },
        });
        console.log('Kafka Consumer запущен и слушает сообщения');
        
      } catch (error) {
        console.error('Ошибка подключения к Kafka:', error);
        console.log('Продолжаем без Kafka');
      }
    } else {
      console.log('Kafka отключена в настройках');
    }
    
    console.log('Базы данных успешно инициализированы');
    return true;
  } catch (error) {
    console.error('Ошибка при инициализации:', error);
    throw error;
  }
};

// Базовый маршрут для проверки работоспособности
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Сервер работает' });
});

// Маршруты для работы со сном
app.use('/api/sleep', require('./routes/sleep'));

// Маршруты для работы с питанием
app.use('/api/nutrition', require('./routes/nutrition'));

// Маршруты для работы с активностью
app.use('/api/activity', require('./routes/activity'));

// Маршруты для работы с самочувствием
app.use('/api/wellbeing', require('./routes/wellbeing'));

// Маршруты для дашборда (статистика)
app.use('/api/dashboard', require('./routes/dashboard'));

// Маршруты для аутентификации
app.use('/api/auth', require('./routes/auth'));

// Маршруты аутентификации
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    const userExists = await writePool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Пользователь уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await writePool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );

    const token = jwt.sign({ id: result.rows[0].id }, config.jwtSecret);
    res.json({ token, user: result.rows[0] });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await writePool.query(
      'SELECT id, email, password_hash FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const token = jwt.sign({ id: user.id }, config.jwtSecret);
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Маршруты для работы с данными
app.post('/api/sleep', async (req, res) => {
  const { sleep_duration, quality, date } = req.body;

  try {
    const result = await writePool.query(
      'INSERT INTO sleep_records (user_id, sleep_duration, quality, date) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, sleep_duration, quality, date]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка сохранения данных о сне:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/sleep', async (req, res) => {
  try {
    const result = await readPool.query(
      'SELECT * FROM sleep_records WHERE user_id = $1 ORDER BY date DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения данных о сне:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/nutrition', async (req, res) => {
  const { meal_type, calories, date } = req.body;

  try {
    const result = await writePool.query(
      'INSERT INTO nutrition_records (user_id, meal_type, calories, date) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, meal_type, calories, date]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка сохранения данных о питании:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/nutrition', async (req, res) => {
  try {
    const result = await readPool.query(
      'SELECT * FROM nutrition_records WHERE user_id = $1 ORDER BY date DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения данных о питании:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/activity', async (req, res) => {
  const { activity_type, duration, calories_burned, date } = req.body;

  try {
    const result = await writePool.query(
      'INSERT INTO activity_records (user_id, activity_type, duration, calories_burned, date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, activity_type, duration, calories_burned, date]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка сохранения данных об активности:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/activity', async (req, res) => {
  try {
    const result = await readPool.query(
      'SELECT * FROM activity_records WHERE user_id = $1 ORDER BY date DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения данных об активности:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.post('/api/wellbeing', async (req, res) => {
  const { mood, stress_level, energy_level, date } = req.body;

  try {
    const result = await writePool.query(
      'INSERT INTO wellbeing_records (user_id, mood, stress_level, energy_level, date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user.id, mood, stress_level, energy_level, date]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка сохранения данных о самочувствии:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

app.get('/api/wellbeing', async (req, res) => {
  try {
    const result = await readPool.query(
      'SELECT * FROM wellbeing_records WHERE user_id = $1 ORDER BY date DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения данных о самочувствии:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Внутренняя ошибка сервера',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Обработка сигналов завершения
process.on('SIGTERM', async () => {
  console.log('Получен сигнал SIGTERM. Завершение работы...');
  if (consumer) {
    await consumer.disconnect();
    console.log('Kafka Consumer отключен');
  }
  if (producer) {
    await producer.disconnect();
    console.log('Kafka Producer отключен');
  }
  if (admin) {
    await admin.disconnect();
    console.log('Kafka Admin отключен');
  }
  console.log('Kafka отключен');
  process.exit(0);
});

// Запуск сервера
async function startServer() {
  try {
    await init();
    
    // Запускаем сервер на порту 3002 (вместо 3001)
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  } catch (error) {
    console.error('Ошибка при запуске сервера:', error);
    process.exit(1);
  }
}

startServer(); 