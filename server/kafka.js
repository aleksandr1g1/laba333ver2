const { Kafka } = require('kafkajs');
const { logger } = require('./utils/logger');

// Настройка Kafka
const kafka = new Kafka({
  clientId: 'health-tracker',
  brokers: ['localhost:9092'],
  retry: {
    initialRetryTime: 300,
    retries: 10
  },
  logCreator: () => ({ namespace, level, log }) => {
    const { message, ...logData } = log;
    switch (level) {
      case 0: // NOTHING
        break;
      case 1: // ERROR
        logger.error(`[Kafka] ${namespace}: ${message}`, logData);
        break;
      case 2: // WARN
        logger.warn(`[Kafka] ${namespace}: ${message}`, logData);
        break;
      case 4: // INFO
        logger.info(`[Kafka] ${namespace}: ${message}`, logData);
        break;
      case 5: // DEBUG
        logger.debug(`[Kafka] ${namespace}: ${message}`, logData);
        break;
      default:
        logger.info(`[Kafka] ${namespace}: ${message}`, logData);
    }
  }
});

// Создание асинхронного подключения
const connectKafka = async () => {
  try {
    const admin = kafka.admin();
    await admin.connect();
    logger.info('Connected to Kafka admin');

    const producer = kafka.producer();
    await producer.connect();
    logger.info('Connected to Kafka producer');

    const consumer = kafka.consumer({ groupId: 'health-tracker-group' });
    await consumer.connect();
    logger.info('Connected to Kafka consumer');

    return { admin, producer, consumer };
  } catch (error) {
    logger.error(`Failed to connect to Kafka: ${error.message}`);
    throw error;
  }
};

// Отключение от Kafka
const disconnectKafka = async ({ admin, producer, consumer }) => {
  try {
    if (admin) await admin.disconnect();
    if (producer) await producer.disconnect();
    if (consumer) await consumer.disconnect();
    logger.info('Disconnected from Kafka');
  } catch (error) {
    logger.error(`Error disconnecting from Kafka: ${error.message}`);
  }
};

// Отправка сообщения
const sendMessage = async (producer, topic, key, value) => {
  try {
    logger.debug(`Sending message to Kafka (topic: ${topic}, key: ${key})`);
    await producer.send({
      topic,
      messages: [{ key, value: JSON.stringify(value) }]
    });
    logger.info(`Message sent to Kafka (topic: ${topic}, key: ${key})`);
    return true;
  } catch (error) {
    logger.error(`Error sending message to Kafka: ${error.message}`);
    throw error;
  }
};

const topics = {
  SLEEP_RECORDS: 'sleep-records',
  ACTIVITY_RECORDS: 'activity-records',
  NUTRITION_RECORDS: 'nutrition-records',
  WELLBEING_RECORDS: 'wellbeing-records'
};

module.exports = {
  kafka,
  connectKafka,
  disconnectKafka,
  sendMessage,
  topics
}; 