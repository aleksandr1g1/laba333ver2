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

echo "Запускаем сервер с эмуляцией Kafka..."
ENABLE_KAFKA=true node index.js 