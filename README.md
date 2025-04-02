# Здоровье и Активность - Трекер

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