-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы сна
CREATE TABLE IF NOT EXISTS sleep_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    sleep_duration INTEGER NOT NULL,
    quality INTEGER NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы питания
CREATE TABLE IF NOT EXISTS nutrition_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    meal_type VARCHAR(50) NOT NULL,
    calories INTEGER NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы активности
CREATE TABLE IF NOT EXISTS activity_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    activity_type VARCHAR(50) NOT NULL,
    duration INTEGER NOT NULL,
    calories_burned INTEGER NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание таблицы самочувствия
CREATE TABLE IF NOT EXISTS wellbeing_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    mood INTEGER NOT NULL,
    stress_level INTEGER NOT NULL,
    energy_level INTEGER NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов
CREATE INDEX IF NOT EXISTS idx_sleep_records_user_id ON sleep_records(user_id);
CREATE INDEX IF NOT EXISTS idx_nutrition_records_user_id ON nutrition_records(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_records_user_id ON activity_records(user_id);
CREATE INDEX IF NOT EXISTS idx_wellbeing_records_user_id ON wellbeing_records(user_id); 