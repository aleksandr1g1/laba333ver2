const express = require('express');
const router = express.Router();
const { readPool, writePool } = require('../db/init');
const { authenticateToken } = require('../middleware/auth');

// Получение всех записей о сне
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await readPool.query(
      'SELECT * FROM sleep_records WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка при получении записей о сне:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Добавление новой записи о сне
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { startTime, endTime, quality } = req.body;
    console.log('Получены данные:', { startTime, endTime, quality, user_id: req.user.id });

    const result = await writePool.query(
      'INSERT INTO sleep_records (user_id, start_time, end_time, quality) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, startTime, endTime, quality]
    );

    const record = result.rows[0];
    console.log('Запись сохранена в базу:', record);

    // Отправляем сообщение в Kafka (безопасно)
    await req.safeSendMessage('sleep-records', record.id.toString(), record);

    res.status(201).json(record);
  } catch (error) {
    console.error('Ошибка при сохранении данных о сне:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Редактирование записи о сне
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { startTime, endTime, quality } = req.body;

    // Проверяем, принадлежит ли запись пользователю
    const checkResult = await readPool.query(
      'SELECT * FROM sleep_records WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }

    const result = await writePool.query(
      'UPDATE sleep_records SET start_time = $1, end_time = $2, quality = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
      [startTime, endTime, quality, id, req.user.id]
    );

    const record = result.rows[0];
    console.log('Запись обновлена в базе:', record);

    // Отправляем сообщение в Kafka (безопасно)
    await req.safeSendMessage('sleep-records', record.id.toString(), record);

    res.json(record);
  } catch (error) {
    console.error('Ошибка при обновлении записи о сне:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удаление записи о сне
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Проверяем, принадлежит ли запись пользователю
    const checkResult = await readPool.query(
      'SELECT * FROM sleep_records WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }

    // Удаляем запись из базы
    await writePool.query(
      'DELETE FROM sleep_records WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    console.log('Запись удалена из базы');

    // Отправляем сообщение в Kafka (безопасно)
    await req.safeSendMessage('sleep-records', id, { id, action: 'delete' });

    res.json({ message: 'Запись успешно удалена' });
  } catch (error) {
    console.error('Ошибка при удалении записи о сне:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router; 