const express = require('express');
const router = express.Router();
const { readPool, writePool } = require('../db/init');
const { authenticateToken } = require('../middleware/auth');

// Получение всех записей о самочувствии
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await readPool.query(
      'SELECT * FROM wellbeing_records WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка при получении записей о самочувствии:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Добавление новой записи о самочувствии
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { date, mood, sleepQuality, energyLevel, stressLevel, notes } = req.body;
    console.log('Получены данные о самочувствии:', { date, mood, sleepQuality, energyLevel, stressLevel, notes, user_id: req.user.id });

    // Если sleepQuality не определено, устанавливаем значение по умолчанию
    const sleep_quality = sleepQuality || 5;

    const result = await writePool.query(
      'INSERT INTO wellbeing_records (user_id, date, mood, sleep_quality, energy_level, stress_level, notes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [req.user.id, date, mood, sleep_quality, energyLevel, stressLevel, notes]
    );

    const record = result.rows[0];
    console.log('Запись о самочувствии сохранена в базу:', record);

    // Отправляем сообщение в Kafka (безопасно)
    await req.safeSendMessage('wellbeing-records', record.id.toString(), record);

    res.status(201).json(record);
  } catch (error) {
    console.error('Ошибка при сохранении данных о самочувствии:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Редактирование записи о самочувствии
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { date, mood, sleepQuality, energyLevel, stressLevel, notes } = req.body;

    // Проверяем, принадлежит ли запись пользователю
    const checkResult = await readPool.query(
      'SELECT * FROM wellbeing_records WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }

    const result = await writePool.query(
      'UPDATE wellbeing_records SET date = $1, mood = $2, sleep_quality = $3, energy_level = $4, stress_level = $5, notes = $6 WHERE id = $7 AND user_id = $8 RETURNING *',
      [date, mood, sleepQuality, energyLevel, stressLevel, notes, id, req.user.id]
    );

    const record = result.rows[0];
    console.log('Запись о самочувствии обновлена в базе:', record);

    // Отправляем сообщение в Kafka (безопасно)
    await req.safeSendMessage('wellbeing-records', record.id.toString(), record);

    res.json(record);
  } catch (error) {
    console.error('Ошибка при обновлении записи о самочувствии:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удаление записи о самочувствии
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Проверяем, принадлежит ли запись пользователю
    const checkResult = await readPool.query(
      'SELECT * FROM wellbeing_records WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Запись не найдена' });
    }

    await writePool.query(
      'DELETE FROM wellbeing_records WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    console.log('Запись о самочувствии удалена из базы');

    // Отправляем сообщение в Kafka (безопасно)
    await req.safeSendMessage('wellbeing-records', id, { id, action: 'delete' });

    res.json({ message: 'Запись успешно удалена' });
  } catch (error) {
    console.error('Ошибка при удалении записи о самочувствии:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router; 