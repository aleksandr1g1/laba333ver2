#!/bin/bash

# Убиваем процесс, если он занимает порт 3002
PORT=3002
PID=$(lsof -t -i:$PORT)
if [ ! -z "$PID" ]; then
  echo "Освобождаю порт $PORT (PID: $PID)..."
  kill -9 $PID
fi

# Создаем директорию для логов Kafka, если её нет
mkdir -p ./kafka/logs

echo "Проверка подключения к PostgreSQL..."
node -e "const { Pool } = require('pg'); const pool = new Pool({user: 'postgres', host: 'localhost', password: 'postgres', port: 5432, database: 'postgres'}); pool.query('SELECT NOW()', (err, res) => { console.log(err ? 'Error: ' + err.message : 'Connected successfully: ' + JSON.stringify(res.rows[0])); pool.end(); });"

echo "Статус Kafka:"
echo "Топики в Kafka:"
sudo docker exec -it kafka /bin/bash -c "kafka-topics --list --bootstrap-server localhost:9092" || echo "Ошибка проверки топиков Kafka"

echo "Запускаем сервер с эмуляцией Kafka..."
ENABLE_KAFKA=true PORT=3002 node index.js 