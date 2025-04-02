const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const writePool = new Pool({
  user: 'health_tracker',
  host: 'localhost',
  database: 'health_tracker_write',
  password: 'health_tracker',
  port: 5432,
});

const readPool = new Pool({
  user: 'health_tracker',
  host: 'localhost',
  database: 'health_tracker_read',
  password: 'health_tracker',
  port: 5432,
});

async function runMigration() {
  try {
    // Создаем таблицы в базе данных для записи
    const writeSchema = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8');
    await writePool.query(writeSchema);
    console.log('Write database schema created successfully');

    // Создаем таблицы в базе данных для чтения
    const readSchema = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf8');
    await readPool.query(readSchema);
    console.log('Read database schema created successfully');

    // Создаем триггеры для репликации
    const triggers = fs.readFileSync(path.join(__dirname, '../db/triggers.sql'), 'utf8');
    await writePool.query(triggers);
    console.log('Triggers created successfully');

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await writePool.end();
    await readPool.end();
  }
}

runMigration(); 