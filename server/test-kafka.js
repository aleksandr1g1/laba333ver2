const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'test-client',
  brokers: ['localhost:9092']
});

const producer = kafka.producer();

async function testKafka() {
  try {
    console.log('Подключаемся к Kafka...');
    await producer.connect();
    console.log('Подключение успешно');

    console.log('Отправляем тестовое сообщение...');
    await producer.send({
      topic: 'sleep-records',
      messages: [
        { value: 'test message' }
      ],
    });
    console.log('Сообщение отправлено успешно');

    await producer.disconnect();
    console.log('Отключение успешно');
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

testKafka(); 