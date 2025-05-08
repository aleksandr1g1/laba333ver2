FROM node:18-alpine as build

WORKDIR /usr/src/app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Собираем статические файлы для production
RUN npm run build

# Используем nginx для раздачи статики
FROM nginx:stable-alpine as production

# Копируем собранные файлы из предыдущего этапа
COPY --from=build /usr/src/app/build /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Открываем порт
EXPOSE 3000

# Запускаем nginx
CMD ["nginx", "-g", "daemon off;"] 