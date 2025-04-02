const { consumer, topics } = require('./kafka');
const { writePool } = require('./db/init');

async function startKafkaConsumer() {
  try {
    // Подписываемся на все топики
    await consumer.subscribe({ topics: Object.values(topics) });

    // Обработка сообщений
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const data = JSON.parse(message.value.toString());
          
          // Определяем таблицу на основе топика
          let table;
          switch (topic) {
            case topics.SLEEP_RECORDS:
              table = 'sleep_records';
              break;
            case topics.ACTIVITY_RECORDS:
              table = 'activity_records';
              break;
            case topics.NUTRITION_RECORDS:
              table = 'nutrition_records';
              break;
            case topics.WELLBEING_RECORDS:
              table = 'wellbeing_records';
              break;
          }

          if (table) {
            // Проверяем, существует ли запись
            const existing = await writePool.query(
              `SELECT id FROM ${table} WHERE id = $1`,
              [data.id]
            );

            if (existing.rows.length === 0) {
              // Создаем динамический SQL-запрос
              const columns = Object.keys(data).join(', ');
              const values = Object.values(data);
              const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

              await writePool.query(
                `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`,
                values
              );
              console.log(`Запись добавлена в таблицу ${table}`);
            }
          }
        } catch (error) {
          console.error(`Ошибка обработки сообщения из топика ${topic}:`, error);
        }
      }
    });

    console.log('Kafka consumer запущен');
  } catch (error) {
    console.error('Ошибка запуска Kafka consumer:', error);
    throw error;
  }
}

module.exports = { startKafkaConsumer }; 