#!/bin/bash

# Запуск Zookeeper
cd kafka
bin/zookeeper-server-start.sh config/zookeeper.properties &
sleep 5

# Запуск Kafka
bin/kafka-server-start.sh config/server.properties &
sleep 5

# Создание топиков
bin/kafka-topics.sh --create --topic sleep-records --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1
bin/kafka-topics.sh --create --topic activity-records --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1
bin/kafka-topics.sh --create --topic nutrition-records --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1
bin/kafka-topics.sh --create --topic wellbeing-records --bootstrap-server localhost:9092 --replication-factor 1 --partitions 1

echo "Kafka запущена и топики созданы" 