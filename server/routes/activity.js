const express = require('express');
const router = express.Router();
const { readPool, writePool } = require('../db/init');
const { authenticateToken } = require('../middleware/auth');

// Получение всех записей об активности
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await readPool.query(
      'SELECT * FROM activity_records WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка при получении записей об активности:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Добавление новой записи об активности
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { activityType, duration, intensity, date } = req.body;
    console.log('Получены данные:', { activityType, duration, intensity, date, user_id: req.user.id });

    // Расчет сожженных калорий на основе продолжительности и интенсивности
    // Базовый коэффициент в зависимости от типа активности (калорий в минуту)
    let baseCaloriesPerMinute = 5; // Значение по умолчанию
    
    switch(activityType) {
      case 'Бег':
        baseCaloriesPerMinute = 10;
        break;
      case 'Ходьба':
        baseCaloriesPerMinute = 4;
        break;
      case 'Плавание':
        baseCaloriesPerMinute = 8;
        break;
      case 'Велосипед':
        baseCaloriesPerMinute = 7;
        break;
      case 'Тренажерный зал':
        baseCaloriesPerMinute = 6;
        break;
      case 'Йога':
        baseCaloriesPerMinute = 3;
        break;
      case 'Танцы':
        baseCaloriesPerMinute = 5;
        break;
      default:
        baseCaloriesPerMinute = 5;
    }
    
    // Рассчитываем калории с учетом интенсивности
    const intensityMultiplier = intensity / 3; // Нормализуем интенсивность (3 - средняя интенсивность)
    const calories_burned = Math.round(baseCaloriesPerMinute * intensityMultiplier * duration);
    
    console.log('Рассчитанные калории:', calories_burned);

    const result = await writePool.query(
      'INSERT INTO activity_records (user_id, activity_type, duration, intensity, date, calories_burned) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.id, activityType, duration, intensity, date, calories_burned]
    );

    const record = result.rows[0];
    console.log('Запись сохранена в базу:', record);

    // Отправляем сообщение в Kafka (безопасно)
    await req.safeSendMessage('activity-records', record.id.toString(), record);

    res.status(201).json(record);
  } catch (error) {
    console.error('Ошибка при сохранении данных об активности:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Редактирование записи об активности
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { activityType, duration, intensity, date } = req.body;

    // Проверяем, принадлежит ли запись пользователю
    const checkResult = await readPool.query(
      'SELECT * FROM activity_records WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }

    // Расчет сожженных калорий на основе продолжительности и интенсивности
    // Базовый коэффициент в зависимости от типа активности (калорий в минуту)
    let baseCaloriesPerMinute = 5; // Значение по умолчанию
    
    switch(activityType) {
      case 'Бег':
        baseCaloriesPerMinute = 10;
        break;
      case 'Ходьба':
        baseCaloriesPerMinute = 4;
        break;
      case 'Плавание':
        baseCaloriesPerMinute = 8;
        break;
      case 'Велосипед':
        baseCaloriesPerMinute = 7;
        break;
      case 'Тренажерный зал':
        baseCaloriesPerMinute = 6;
        break;
      case 'Йога':
        baseCaloriesPerMinute = 3;
        break;
      case 'Танцы':
        baseCaloriesPerMinute = 5;
        break;
      default:
        baseCaloriesPerMinute = 5;
    }
    
    // Рассчитываем калории с учетом интенсивности
    const intensityMultiplier = intensity / 3; // Нормализуем интенсивность (3 - средняя интенсивность)
    const calories_burned = Math.round(baseCaloriesPerMinute * intensityMultiplier * duration);
    
    console.log('Рассчитанные калории при обновлении:', calories_burned);

    const result = await writePool.query(
      'UPDATE activity_records SET activity_type = $1, duration = $2, intensity = $3, date = $4, calories_burned = $5 WHERE id = $6 AND user_id = $7 RETURNING *',
      [activityType, duration, intensity, date, calories_burned, id, req.user.id]
    );

    const record = result.rows[0];
    console.log('Запись обновлена в базе:', record);

    // Отправляем сообщение в Kafka (безопасно)
    await req.safeSendMessage('activity-records', record.id.toString(), record);

    res.json(record);
  } catch (error) {
    console.error('Ошибка при обновлении записи об активности:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удаление записи об активности
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Проверяем, принадлежит ли запись пользователю
    const checkResult = await readPool.query(
      'SELECT * FROM activity_records WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }

    // Удаляем запись из базы
    await writePool.query(
      'DELETE FROM activity_records WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    console.log('Запись удалена из базы');

    // Отправляем сообщение в Kafka (безопасно)
    await req.safeSendMessage('activity-records', id, { id, action: 'delete' });

    res.json({ message: 'Запись успешно удалена' });
  } catch (error) {
    console.error('Ошибка при удалении записи об активности:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router; 