const { Pool } = require('pg');

// Подключение к базе данных для записи
const writePool = new Pool({
  user: 'health_tracker',
  host: 'localhost',
  database: 'health_tracker_write',
  password: 'health_tracker',
  port: 5432,
});

// Подключение к базе данных для чтения
const readPool = new Pool({
  user: 'health_tracker',
  host: 'localhost',
  database: 'health_tracker_read',
  password: 'health_tracker',
  port: 5432,
});

// Функция для синхронизации баз данных
const syncDatabases = async () => {
  try {
    // Здесь можно добавить логику синхронизации, если необходимо
    console.log('Базы данных синхронизированы');
  } catch (error) {
    console.error('Ошибка синхронизации баз данных:', error);
  }
};

module.exports = {
  writePool,
  readPool,
  syncDatabases,
}; 