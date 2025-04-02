const fs = require('fs');
const path = require('path');

// Создаем папку для хранения сообщений
const kafkaLogsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(kafkaLogsDir)) {
  fs.mkdirSync(kafkaLogsDir, { recursive: true });
}

// Эмулятор Kafka-продюсера
const createProducer = async () => {
  console.log('Создан эмулятор Kafka-продюсера');
  
  return {
    connect: async () => {
      console.log('Эмулятор Kafka подключен');
      return true;
    },
    send: async ({ topic, messages }) => {
      console.log(`Эмулятор Kafka: отправка ${messages.length} сообщений в тему ${topic}`);
      
      // Сохраняем сообщения в файл для тестирования
      const topicFile = path.join(kafkaLogsDir, `${topic}.log`);
      
      messages.forEach(msg => {
        const logEntry = {
          key: msg.key,
          value: msg.value,
          timestamp: new Date().toISOString()
        };
        
        fs.appendFileSync(
          topicFile, 
          JSON.stringify(logEntry) + '\n', 
          { flag: 'a' }
        );
      });
      
      return { success: true };
    },
    disconnect: async () => {
      console.log('Эмулятор Kafka отключен');
      return true;
    }
  };
};

// Эмулятор Kafka-потребителя
const createConsumer = async ({ groupId }) => {
  console.log(`Создан эмулятор Kafka-потребителя с группой ${groupId}`);
  
  return {
    connect: async () => {
      console.log('Эмулятор Kafka-потребителя подключен');
      return true;
    },
    subscribe: async ({ topics }) => {
      console.log(`Эмулятор Kafka-потребителя подписан на темы: ${topics.join(', ')}`);
      return true;
    },
    run: async ({ eachMessage }) => {
      console.log('Эмулятор Kafka-потребителя запущен');
      
      // Здесь можно реализовать чтение из файлов и эмуляцию получения сообщений
      // Для упрощения оставим только логирование
      
      return true;
    },
    disconnect: async () => {
      console.log('Эмулятор Kafka-потребителя отключен');
      return true;
    }
  };
};

// Эмулятор Kafka-администратора
const createAdmin = async () => {
  console.log('Создан эмулятор Kafka-администратора');
  
  return {
    connect: async () => {
      console.log('Эмулятор Kafka-администратора подключен');
      return true;
    },
    createTopics: async ({ topics }) => {
      console.log(`Эмулятор Kafka: созданы темы ${topics.map(t => t.topic).join(', ')}`);
      
      // Создаем файлы для каждой темы
      topics.forEach(topic => {
        const topicFile = path.join(kafkaLogsDir, `${topic.topic}.log`);
        if (!fs.existsSync(topicFile)) {
          fs.writeFileSync(topicFile, '', { flag: 'w' });
        }
      });
      
      return true;
    },
    disconnect: async () => {
      console.log('Эмулятор Kafka-администратора отключен');
      return true;
    }
  };
};

module.exports = {
  Kafka: class {
    constructor() {
      console.log('Инициализация эмулятора Kafka');
    }
    
    producer() {
      return createProducer();
    }
    
    consumer({ groupId }) {
      return createConsumer({ groupId });
    }
    
    admin() {
      return createAdmin();
    }
  }
}; 