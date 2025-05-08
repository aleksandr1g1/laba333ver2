FROM node:18-alpine

WORKDIR /usr/src/app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Создаем директорию для логов
RUN mkdir -p logs

# Открываем порт
EXPOSE 3002

# Запускаем приложение
CMD ["node", "index.js"] 