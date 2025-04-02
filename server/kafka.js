const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'health-tracker',
  brokers: ['localhost:9092'],
  retry: {
    initialRetryTime: 100,
    retries: 8
  }
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'health-tracker-group' });

const topics = {
  SLEEP_RECORDS: 'sleep-records',
  ACTIVITY_RECORDS: 'activity-records',
  NUTRITION_RECORDS: 'nutrition-records',
  WELLBEING_RECORDS: 'wellbeing-records'
};

async function connectKafka() {
  try {
    await producer.connect();
    await consumer.connect();
    console.log('Kafka подключен успешно');
  } catch (error) {
    console.error('Ошибка подключения к Kafka:', error);
    throw error;
  }
}

async function disconnectKafka() {
  try {
    await producer.disconnect();
    await consumer.disconnect();
    console.log('Kafka отключен');
  } catch (error) {
    console.error('Ошибка отключения от Kafka:', error);
    throw error;
  }
}

async function sendMessage(topic, key, value) {
  try {
    await producer.send({
      topic,
      messages: [
        {
          key: key.toString(),
          value: JSON.stringify(value)
        }
      ]
    });
    console.log(`Сообщение отправлено в топик ${topic}`);
  } catch (error) {
    console.error(`Ошибка отправки сообщения в топик ${topic}:`, error);
    throw error;
  }
}

module.exports = {
  kafka,
  producer,
  consumer,
  topics,
  connectKafka,
  disconnectKafka,
  sendMessage
}; 