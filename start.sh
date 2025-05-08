#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Health Tracker Application...${NC}"

# Проверка наличия Docker и Docker Compose
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker не установлен. Пожалуйста, установите Docker.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose не установлен. Пожалуйста, установите Docker Compose.${NC}"
    exit 1
fi

# Создаем директории для логов, если они не существуют
mkdir -p logs/nginx
mkdir -p server/logs

# Проверяем есть ли контейнеры, чтобы остановить их перед запуском
if docker ps -q --filter "name=healthtracker" | grep -q .; then
    echo -e "${YELLOW}Остановка существующих контейнеров...${NC}"
    docker-compose down
fi

# Проверяем, запущены ли серверные процессы (без Docker)
server_pid=$(lsof -t -i:3002 2>/dev/null)
if [ ! -z "$server_pid" ]; then
    echo -e "${YELLOW}Останавливаем сервер на порту 3002...${NC}"
    kill -9 $server_pid
fi

client_pid=$(lsof -t -i:3000 2>/dev/null)
if [ ! -z "$client_pid" ]; then
    echo -e "${YELLOW}Останавливаем клиент на порту 3000...${NC}"
    kill -9 $client_pid
fi

# Запускаем сервер вручную (без Docker)
echo -e "${YELLOW}Запуск сервера...${NC}"
cd server
npm start &
cd ..

# Даем серверу время на запуск
sleep 5

# Запускаем клиент
echo -e "${YELLOW}Запуск клиента...${NC}"
cd client
npm start &
cd ..

# Даем приложению время на запуск
sleep 10

echo -e "${GREEN}Все сервисы запущены!${NC}"
echo -e "${GREEN}Приложение доступно по адресу: http://localhost:3000${NC}"

# Проверяем доступность метрик
echo -e "${YELLOW}Проверка доступности метрик...${NC}"
if curl -s http://localhost:3002/api/metrics > /dev/null; then
    echo -e "${GREEN}Метрики доступны по адресу: http://localhost:3002/api/metrics${NC}"
else
    echo -e "${RED}Метрики недоступны по адресу http://localhost:3002/api/metrics${NC}"
    echo -e "${YELLOW}Попробуйте открыть метрики вручную в браузере: http://localhost:3002/api/metrics${NC}"
fi

# Проверяем доступность health
echo -e "${YELLOW}Проверка доступности health...${NC}"
if curl -s http://localhost:3002/api/health > /dev/null; then
    echo -e "${GREEN}Health статус доступен по адресу: http://localhost:3002/api/health${NC}"
else
    echo -e "${RED}Health статус недоступен по адресу http://localhost:3002/api/health${NC}"
    echo -e "${YELLOW}Попробуйте открыть health статус вручную в браузере: http://localhost:3002/api/health${NC}"
fi 