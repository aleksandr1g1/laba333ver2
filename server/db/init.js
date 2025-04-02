const { Pool } = require('pg');
const config = require('../config/config');

// Создаем пул для подключения к postgres (системная база данных)
const postgresPool = new Pool({
  user: config.db.user,
  host: config.db.host,
  database: 'postgres',
  password: config.db.password,
  port: config.db.port,
});

// Пул для записи
const writePool = new Pool({
  user: config.db.user,
  host: config.db.host,
  database: config.db.database,
  password: config.db.password,
  port: config.db.port,
});

// Пул для чтения (в реальном проекте может быть другой сервер)
const readPool = new Pool({
  user: config.db.user,
  host: config.db.host,
  database: config.db.database,
  password: config.db.password,
  port: config.db.port,
});

// Для обратной совместимости
const pool = writePool;

async function createDatabase() {
  const client = await postgresPool.connect();
  try {
    // Проверяем, существует ли база данных
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [config.db.database]
    );

    if (result.rows.length === 0) {
      // Создаем базу данных
      await client.query(`CREATE DATABASE ${config.db.database}`);
      console.log(`База данных ${config.db.database} успешно создана`);
    } else {
      console.log(`База данных ${config.db.database} уже существует`);
    }
  } catch (error) {
    console.error('Ошибка при создании базы данных:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function executeQuery(query) {
  const client = await writePool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query(query);
    await client.query('COMMIT');
    console.log('Запрос выполнен успешно');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Ошибка при выполнении запроса:', error);
    throw error;
  } finally {
    client.release();
  }
}

async function dropTables() {
  const dropQuery = `
    DROP TABLE IF EXISTS sleep_records CASCADE;
    DROP TABLE IF EXISTS nutrition_records CASCADE;
    DROP TABLE IF EXISTS activity_records CASCADE;
    DROP TABLE IF EXISTS wellbeing_records CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
  `;
  await executeQuery(dropQuery);
}

async function createTables() {
  const createTablesQuery = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sleep_records (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      start_time TIMESTAMP NOT NULL,
      end_time TIMESTAMP NOT NULL,
      quality INTEGER CHECK (quality BETWEEN 1 AND 5),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS nutrition_records (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      dish_name VARCHAR(255) NOT NULL,
      proteins DECIMAL(5,2) NOT NULL,
      fats DECIMAL(5,2) NOT NULL,
      carbs DECIMAL(5,2) NOT NULL,
      date DATE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS activity_records (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      activity_type VARCHAR(100) NOT NULL,
      duration INTEGER NOT NULL,
      intensity INTEGER CHECK (intensity BETWEEN 1 AND 5),
      date DATE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS wellbeing_records (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      mood INTEGER CHECK (mood BETWEEN 1 AND 5),
      energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 5),
      stress_level INTEGER CHECK (stress_level BETWEEN 1 AND 5),
      notes TEXT,
      date DATE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;
  await executeQuery(createTablesQuery);
}

async function initDatabases() {
  try {
    // Создаем базу данных, если она не существует
    await createDatabase();
    
    // Пересоздаем таблицы только при первом запуске или при необходимости
    const checkTableQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `;
    const result = await executeQuery(checkTableQuery);
    
    if (!result.rows[0].exists) {
      await dropTables();
      await createTables();
      console.log('Базы данных успешно инициализированы');
    } else {
      console.log('Таблицы уже существуют, пропускаем инициализацию');
    }
  } catch (error) {
    console.error('Ошибка при инициализации баз данных:', error);
    throw error;
  }
}

module.exports = {
  pool,
  writePool,
  readPool,
  initDatabases
}; 