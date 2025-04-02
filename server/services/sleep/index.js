const express = require('express');
const router = express.Router();
const { writePool, readPool } = require('../../db/config');

// Создание записи о сне
router.post('/sleep', async (req, res) => {
  try {
    const { userId, sleepTime, wakeTime, quality, notes } = req.body;
    const query = `
      INSERT INTO sleep_records (user_id, sleep_time, wake_time, quality, notes)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await writePool.query(query, [userId, sleepTime, wakeTime, quality, notes]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при создании записи о сне' });
  }
});

// Получение записей о сне пользователя
router.get('/sleep/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const query = `
      SELECT * FROM sleep_records
      WHERE user_id = $1
      ORDER BY sleep_time DESC
    `;
    const result = await readPool.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении записей о сне' });
  }
});

// Получение статистики сна
router.get('/sleep/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const query = `
      SELECT 
        AVG(EXTRACT(EPOCH FROM (wake_time - sleep_time))/3600) as avg_duration,
        AVG(quality) as avg_quality,
        COUNT(*) as total_records
      FROM sleep_records
      WHERE user_id = $1
    `;
    const result = await readPool.query(query, [userId]);
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении статистики сна' });
  }
});

module.exports = router; 