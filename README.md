# Здоровье и Активность - Трекер

## Health Tracker Application

Health Tracker - это приложение для отслеживания различных аспектов здоровья: сон, питание, физическая активность и самочувствие.

### Архитектура приложения

- **Базы данных**: Две PostgreSQL базы данных для разделения записи и чтения
- **Сервер**: Node.js + Express API
- **Клиент**: React SPA (одностраничное приложение)
- **Обмен данными**: Kafka для синхронизации между базами данных
- **Прокси**: Nginx для маршрутизации запросов
- **Мониторинг**: Prometheus-совместимые метрики и логирование через Winston
- **Контейнеризация**: Docker и Docker Compose для управления микросервисами

### Требования

- Docker и Docker Compose
- Node.js 18+
- PostgreSQL 14+

### Установка и запуск

#### Автоматический запуск с Docker

Самый простой способ запустить приложение - использовать Docker Compose:

```
./start.sh
```

Это запустит все компоненты приложения в контейнерах и сделает его доступным по адресу `http://localhost`.

#### Запуск вручную

1. **Установка зависимостей**:
   
   Для сервера:
   ```
   cd server
   npm install
   ```
   
   Для клиента:
   ```
   cd client
   npm install
   ```

2. **Настройка баз данных**:
   
   ```
   // Создание баз данных
   createdb health_tracker_write
   createdb health_tracker_read
   
   // Применение миграций
   cd server
   npm run migrate
   ```

3. **Запуск сервисов**:
   
   Запуск Zookeeper и Kafka (если нужны):
   ```
   ./start-kafka.sh
   ```
   
   Запуск сервера:
   ```
   cd server
   ./start.sh
   ```
   
   Запуск клиента:
   ```
   cd client
   npm start
   ```

### Мониторинг и Метрики

Приложение предоставляет следующие эндпоинты для мониторинга:

- **Метрики**: `http://localhost/metrics` - Prometheus-совместимые метрики
- **Здоровье системы**: `http://localhost/health` - Статус здоровья всех компонентов

Основные метрики:

- `http_requests_total` - Счетчик HTTP-запросов с метками для метода, маршрута и кода статуса
- `http_request_duration_seconds` - Время выполнения запросов
- `service_health_status` - Статус здоровья каждого сервиса (1 - работает, 0 - не работает)

### API Endpoints

- **/api/auth** - Аутентификация и регистрация
- **/api/dashboard** - Статистика и данные дашборда
- **/api/sleep** - Данные о сне
- **/api/nutrition** - Данные о питании
- **/api/activity** - Данные о физической активности
- **/api/wellbeing** - Данные о самочувствии

### Логирование

Логи сохраняются в следующих директориях:
- Серверные логи: `server/logs/`
- Nginx логи: `logs/nginx/`

## Инструкции по запуску

### Запуск без Kafka
Для простого запуска приложения без Kafka:

```bash
# Запуск сервера
cd server
./start.sh

# Запуск клиента
cd client
npm start
```

### Установка и настройка Kafka (опционально)

1. Скачайте Apache Kafka с официального сайта: https://kafka.apache.org/downloads

2. Распакуйте архив:
```bash
tar -xzf kafka_2.13-3.6.2.tgz
cd kafka_2.13-3.6.2
```

3. Запустите Zookeeper (в отдельном терминале):
```bash
bin/zookeeper-server-start.sh config/zookeeper.properties
```

4. Запустите Kafka (в отдельном терминале):
```bash
bin/kafka-server-start.sh config/server.properties
```

5. Создайте необходимые топики (в третьем терминале):
```bash
bin/kafka-topics.sh --create --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1 --topic sleep-records
bin/kafka-topics.sh --create --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1 --topic nutrition-records
bin/kafka-topics.sh --create --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1 --topic activity-records
bin/kafka-topics.sh --create --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1 --topic wellbeing-records
```

6. Проверьте, что топики созданы:
```bash
bin/kafka-topics.sh --list --bootstrap-server localhost:9092
```

7. Запустите приложение с включенной Kafka:
```bash
# Отредактируйте файл server/start.sh, удалите параметр ENABLE_KAFKA=false
# И запустите сервер
cd server
./start.sh
```

## Устранение проблем

1. Если возникает ошибка "Порт 3002 уже используется", запустите скрипт `server/start.sh`, который автоматически освободит порт.

2. Если возникает ошибка подключения к Kafka, убедитесь что:
   - Zookeeper запущен и работает
   - Kafka-сервер запущен и работает
   - Созданы все необходимые топики
   - В файле server/start.sh удален параметр `ENABLE_KAFKA=false`

3. Для просмотра сообщений в Kafka используйте:
```bash
bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic sleep-records --from-beginning
``` 