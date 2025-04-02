const express = require('express');
const router = express.Router();
const { readPool, writePool } = require('../db/init');
const { authenticateToken } = require('../middleware/auth');

// Получение всех записей о питании
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await readPool.query(
      'SELECT * FROM nutrition_records WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка при получении записей о питании:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создание новой записи о питании
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { dish_name, proteins, fats, carbs, date, dishes_data } = req.body;
    console.log('Получены данные о питании:', req.body);

    // Проверяем наличие нужных полей
    if (!dish_name || !proteins || !fats || !carbs || !date) {
      return res.status(400).json({ error: 'Неверный формат данных' });
    }

    // Добавляем колонку dishes_data, если её еще нет
    try {
      await writePool.query(`
        ALTER TABLE nutrition_records 
        ADD COLUMN IF NOT EXISTS dishes_data TEXT
      `);
    } catch (altError) {
      console.error('Ошибка при добавлении колонки dishes_data:', altError);
      // Продолжаем выполнение даже при ошибке добавления колонки
    }

    const result = await writePool.query(
      'INSERT INTO nutrition_records (user_id, dish_name, proteins, fats, carbs, date, dishes_data) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [req.user.id, dish_name, proteins, fats, carbs, date, dishes_data]
    );

    const record = result.rows[0];
    console.log('Запись о питании сохранена в базу:', record);
    
    // Отправляем сообщение в Kafka (безопасно)
    await req.safeSendMessage('nutrition-records', record.id.toString(), record);

    res.status(201).json(record);
  } catch (error) {
    console.error('Ошибка при сохранении данных о питании:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновление записи о питании
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { dish_name, proteins, fats, carbs, date, dishes_data } = req.body;

    // Проверяем наличие нужных полей
    if (!dish_name || !proteins || !fats || !carbs || !date) {
      return res.status(400).json({ error: 'Неверный формат данных' });
    }

    // Проверяем, принадлежит ли запись пользователю
    const checkResult = await readPool.query(
      'SELECT * FROM nutrition_records WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }

    // Добавляем колонку dishes_data, если её еще нет
    try {
      await writePool.query(`
        ALTER TABLE nutrition_records 
        ADD COLUMN IF NOT EXISTS dishes_data TEXT
      `);
    } catch (altError) {
      console.error('Ошибка при добавлении колонки dishes_data:', altError);
      // Продолжаем выполнение даже при ошибке добавления колонки
    }

    const result = await writePool.query(
      'UPDATE nutrition_records SET dish_name = $1, proteins = $2, fats = $3, carbs = $4, date = $5, dishes_data = $6 WHERE id = $7 AND user_id = $8 RETURNING *',
      [dish_name, proteins, fats, carbs, date, dishes_data, id, req.user.id]
    );

    const record = result.rows[0];
    console.log('Запись о питании обновлена в базе:', record);
    
    // Отправляем сообщение в Kafka (безопасно)
    await req.safeSendMessage('nutrition-records', record.id.toString(), record);

    res.json(record);
  } catch (error) {
    console.error('Ошибка при обновлении записи о питании:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удаление записи о питании
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Проверяем, принадлежит ли запись пользователю
    const checkResult = await readPool.query(
      'SELECT * FROM nutrition_records WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }

    await writePool.query(
      'DELETE FROM nutrition_records WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    console.log('Запись о питании удалена из базы');
    
    // Отправляем сообщение в Kafka (безопасно)
    await req.safeSendMessage('nutrition-records', id, { id, action: 'delete' });

    res.json({ message: 'Запись успешно удалена' });
  } catch (error) {
    console.error('Ошибка при удалении записи о питании:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router; 