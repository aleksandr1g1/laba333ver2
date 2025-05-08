-- Изменение таблицы sleep_records
ALTER TABLE sleep_records 
  ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS end_time TIMESTAMP WITH TIME ZONE;

-- Обновление данных в таблице sleep_records (заполнение новых полей на основе существующих)
UPDATE sleep_records 
SET start_time = created_at - (sleep_duration || ' minutes')::INTERVAL,
    end_time = created_at
WHERE start_time IS NULL AND end_time IS NULL;

-- Изменение таблицы nutrition_records
ALTER TABLE nutrition_records 
  ADD COLUMN IF NOT EXISTS dish_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS proteins NUMERIC,
  ADD COLUMN IF NOT EXISTS carbs NUMERIC,
  ADD COLUMN IF NOT EXISTS fats NUMERIC,
  ADD COLUMN IF NOT EXISTS dishes_data TEXT;

-- Обновление данных в таблице nutrition_records
UPDATE nutrition_records 
SET dish_name = meal_type,
    proteins = calories * 0.25 / 4,
    carbs = calories * 0.55 / 4,
    fats = calories * 0.2 / 9
WHERE dish_name IS NULL;

-- Изменение таблицы activity_records
ALTER TABLE activity_records 
  ADD COLUMN IF NOT EXISTS type VARCHAR(255),
  ADD COLUMN IF NOT EXISTS intensity INTEGER CHECK (intensity BETWEEN 1 AND 10);

-- Обновление данных в таблице activity_records
UPDATE activity_records 
SET type = activity_type,
    intensity = 5
WHERE type IS NULL;

-- Изменение таблицы wellbeing_records
ALTER TABLE wellbeing_records 
  ADD COLUMN IF NOT EXISTS sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 10),
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Обновление данных в таблице wellbeing_records
UPDATE wellbeing_records 
SET sleep_quality = 5
WHERE sleep_quality IS NULL; 