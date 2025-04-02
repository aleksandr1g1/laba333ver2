const express = require('express');
const router = express.Router();
const { readPool } = require('../db/init');
const { authenticateToken } = require('../middleware/auth');

// Получение статистики по всем типам записей
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // Получаем статистику за последние 7 дней
    const days = 7;
    const date = new Date();
    date.setDate(date.getDate() - days);
    const fromDate = date.toISOString().split('T')[0];

    // Выполняем все запросы параллельно
    const [sleepStats, nutritionStats, activityStats, wellbeingStats, 
           allTimeSleepStats, allTimeNutritionStats, allTimeActivityStats, allTimeWellbeingStats,
           sleepDailyAllTime, nutritionDailyAllTime, activityDailyAllTime, wellbeingDailyAllTime] = await Promise.all([
      // Статистика сна за 7 дней
      readPool.query(
        'SELECT date(start_time) as date, AVG(quality) as avg_quality, ' +
        'AVG(EXTRACT(EPOCH FROM (end_time - start_time))/3600) as avg_duration ' +
        'FROM sleep_records WHERE user_id = $1 AND start_time >= $2 ' +
        'GROUP BY date(start_time) ORDER BY date(start_time)',
        [req.user.id, fromDate]
      ),
      
      // Статистика питания за 7 дней
      readPool.query(
        'SELECT date, AVG(proteins) as avg_proteins, AVG(carbs) as avg_carbs, AVG(fats) as avg_fats ' +
        'FROM nutrition_records WHERE user_id = $1 AND date >= $2 ' +
        'GROUP BY date ORDER BY date',
        [req.user.id, fromDate]
      ),
      
      // Статистика активности за 7 дней
      readPool.query(
        'SELECT date, AVG(duration) as avg_duration, AVG(intensity) as avg_intensity ' +
        'FROM activity_records WHERE user_id = $1 AND date >= $2 ' +
        'GROUP BY date ORDER BY date',
        [req.user.id, fromDate]
      ),
      
      // Статистика самочувствия за 7 дней
      readPool.query(
        'SELECT date, AVG(mood) as avg_mood, AVG(energy_level) as avg_energy, AVG(stress_level) as avg_stress ' +
        'FROM wellbeing_records WHERE user_id = $1 AND date >= $2 ' +
        'GROUP BY date ORDER BY date',
        [req.user.id, fromDate]
      ),
      
      // Общая статистика сна за все время
      readPool.query(
        'SELECT COUNT(*) as total_records, ' +
        'AVG(quality) as avg_quality, ' +
        'AVG(EXTRACT(EPOCH FROM (end_time - start_time))/3600) as avg_duration, ' +
        'MIN(start_time) as first_record_date, ' +
        'MAX(start_time) as last_record_date ' +
        'FROM sleep_records WHERE user_id = $1',
        [req.user.id]
      ),
      
      // Общая статистика питания за все время
      readPool.query(
        'SELECT COUNT(*) as total_records, ' +
        'AVG(proteins) as avg_proteins, ' +
        'AVG(carbs) as avg_carbs, ' +
        'AVG(fats) as avg_fats, ' +
        'MIN(date) as first_record_date, ' +
        'MAX(date) as last_record_date ' +
        'FROM nutrition_records WHERE user_id = $1',
        [req.user.id]
      ),
      
      // Общая статистика активности за все время
      readPool.query(
        'SELECT COUNT(*) as total_records, ' +
        'AVG(duration) as avg_duration, ' +
        'AVG(intensity) as avg_intensity, ' +
        'MIN(date) as first_record_date, ' +
        'MAX(date) as last_record_date ' +
        'FROM activity_records WHERE user_id = $1',
        [req.user.id]
      ),
      
      // Общая статистика самочувствия за все время
      readPool.query(
        'SELECT COUNT(*) as total_records, ' +
        'AVG(mood) as avg_mood, ' +
        'AVG(energy_level) as avg_energy, ' +
        'AVG(stress_level) as avg_stress, ' +
        'MIN(date) as first_record_date, ' +
        'MAX(date) as last_record_date ' +
        'FROM wellbeing_records WHERE user_id = $1',
        [req.user.id]
      ),
      
      // Ежедневные данные сна за все время
      readPool.query(
        'SELECT date(start_time) as date, AVG(quality) as avg_quality, ' +
        'AVG(EXTRACT(EPOCH FROM (end_time - start_time))/3600) as avg_duration ' +
        'FROM sleep_records WHERE user_id = $1 ' +
        'GROUP BY date(start_time) ORDER BY date(start_time)',
        [req.user.id]
      ),
      
      // Ежедневные данные питания за все время
      readPool.query(
        'SELECT date, AVG(proteins) as avg_proteins, AVG(carbs) as avg_carbs, AVG(fats) as avg_fats ' +
        'FROM nutrition_records WHERE user_id = $1 ' +
        'GROUP BY date ORDER BY date',
        [req.user.id]
      ),
      
      // Ежедневные данные активности за все время
      readPool.query(
        'SELECT date, AVG(duration) as avg_duration, AVG(intensity) as avg_intensity ' +
        'FROM activity_records WHERE user_id = $1 ' +
        'GROUP BY date ORDER BY date',
        [req.user.id]
      ),
      
      // Ежедневные данные самочувствия за все время
      readPool.query(
        'SELECT date, AVG(mood) as avg_mood, AVG(energy_level) as avg_energy, AVG(stress_level) as avg_stress ' +
        'FROM wellbeing_records WHERE user_id = $1 ' +
        'GROUP BY date ORDER BY date',
        [req.user.id]
      )
    ]);

    // Собираем данные в единый объект
    const stats = {
      // Данные за последние 7 дней
      recent: {
        sleep: sleepStats.rows,
        nutrition: nutritionStats.rows,
        activity: activityStats.rows,
        wellbeing: wellbeingStats.rows,
        // Сводная статистика за 7 дней
        summary: {
          sleepCount: sleepStats.rowCount,
          nutritionCount: nutritionStats.rowCount,
          activityCount: activityStats.rowCount,
          wellbeingCount: wellbeingStats.rowCount,
          totalRecords: sleepStats.rowCount + nutritionStats.rowCount + activityStats.rowCount + wellbeingStats.rowCount
        }
      },
      // Данные за все время
      allTime: {
        sleep: {
          ...allTimeSleepStats.rows[0] || {},
          byDate: sleepDailyAllTime.rows || []
        },
        nutrition: {
          ...allTimeNutritionStats.rows[0] || {},
          byDate: nutritionDailyAllTime.rows || []
        },
        activity: {
          ...allTimeActivityStats.rows[0] || {},
          byDate: activityDailyAllTime.rows || []
        },
        wellbeing: {
          ...allTimeWellbeingStats.rows[0] || {},
          byDate: wellbeingDailyAllTime.rows || []
        },
        // Сводная статистика за все время
        summary: {
          sleepCount: allTimeSleepStats.rows[0]?.total_records || 0,
          nutritionCount: allTimeNutritionStats.rows[0]?.total_records || 0,
          activityCount: allTimeActivityStats.rows[0]?.total_records || 0,
          wellbeingCount: allTimeWellbeingStats.rows[0]?.total_records || 0,
          totalRecords: 
            parseInt(allTimeSleepStats.rows[0]?.total_records || 0) + 
            parseInt(allTimeNutritionStats.rows[0]?.total_records || 0) + 
            parseInt(allTimeActivityStats.rows[0]?.total_records || 0) + 
            parseInt(allTimeWellbeingStats.rows[0]?.total_records || 0),
          firstRecordDate: [
            allTimeSleepStats.rows[0]?.first_record_date,
            allTimeNutritionStats.rows[0]?.first_record_date,
            allTimeActivityStats.rows[0]?.first_record_date,
            allTimeWellbeingStats.rows[0]?.first_record_date
          ].filter(Boolean).sort()[0] || null
        }
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Ошибка при получении статистики для дашборда:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router; 