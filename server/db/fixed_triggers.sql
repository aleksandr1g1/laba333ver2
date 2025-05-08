-- Функция для репликации данных
CREATE OR REPLACE FUNCTION replicate_data()
RETURNS TRIGGER AS $$
DECLARE
    query text;
BEGIN
    -- Подключаемся к базе данных для чтения, используя правильные учетные данные
    PERFORM dblink_connect('dbname=health_tracker_read user=postgres password=postgres host=localhost port=5432');
    
    -- В зависимости от таблицы, выполняем соответствующую операцию
    CASE TG_TABLE_NAME
        WHEN 'users' THEN
            IF TG_OP = 'INSERT' THEN
                query := format('INSERT INTO users (id, email, password_hash, created_at, updated_at) 
                             VALUES (%L, %L, %L, %L, %L)',
                            NEW.id, NEW.email, NEW.password_hash, NEW.created_at, NEW.updated_at);
                PERFORM dblink_exec(query);
            ELSIF TG_OP = 'UPDATE' THEN
                query := format('UPDATE users SET email = %L, password_hash = %L, updated_at = %L 
                             WHERE id = %L',
                            NEW.email, NEW.password_hash, NEW.updated_at, NEW.id);
                PERFORM dblink_exec(query);
            ELSIF TG_OP = 'DELETE' THEN
                query := format('DELETE FROM users WHERE id = %L', OLD.id);
                PERFORM dblink_exec(query);
            END IF;
            
        WHEN 'sleep_records' THEN
            IF TG_OP = 'INSERT' THEN
                query := format('INSERT INTO sleep_records (id, user_id, sleep_duration, quality, date, created_at, updated_at) 
                             VALUES (%L, %L, %L, %L, %L, %L, %L)',
                            NEW.id, NEW.user_id, NEW.sleep_duration, NEW.quality, NEW.date, 
                            NEW.created_at, NEW.updated_at);
                PERFORM dblink_exec(query);
            ELSIF TG_OP = 'UPDATE' THEN
                query := format('UPDATE sleep_records SET user_id = %L, sleep_duration = %L, quality = %L, 
                             date = %L, updated_at = %L WHERE id = %L',
                            NEW.user_id, NEW.sleep_duration, NEW.quality, NEW.date, 
                            NEW.updated_at, NEW.id);
                PERFORM dblink_exec(query);
            ELSIF TG_OP = 'DELETE' THEN
                query := format('DELETE FROM sleep_records WHERE id = %L', OLD.id);
                PERFORM dblink_exec(query);
            END IF;
            
        WHEN 'nutrition_records' THEN
            IF TG_OP = 'INSERT' THEN
                query := format('INSERT INTO nutrition_records (id, user_id, meal_type, calories, date, created_at, updated_at) 
                             VALUES (%L, %L, %L, %L, %L, %L, %L)',
                            NEW.id, NEW.user_id, NEW.meal_type, NEW.calories, NEW.date, 
                            NEW.created_at, NEW.updated_at);
                PERFORM dblink_exec(query);
            ELSIF TG_OP = 'UPDATE' THEN
                query := format('UPDATE nutrition_records SET user_id = %L, meal_type = %L, calories = %L, 
                             date = %L, updated_at = %L WHERE id = %L',
                            NEW.user_id, NEW.meal_type, NEW.calories, NEW.date, 
                            NEW.updated_at, NEW.id);
                PERFORM dblink_exec(query);
            ELSIF TG_OP = 'DELETE' THEN
                query := format('DELETE FROM nutrition_records WHERE id = %L', OLD.id);
                PERFORM dblink_exec(query);
            END IF;
            
        WHEN 'activity_records' THEN
            IF TG_OP = 'INSERT' THEN
                query := format('INSERT INTO activity_records (id, user_id, activity_type, duration, calories_burned, date, created_at, updated_at) 
                             VALUES (%L, %L, %L, %L, %L, %L, %L, %L)',
                            NEW.id, NEW.user_id, NEW.activity_type, NEW.duration, NEW.calories_burned, 
                            NEW.date, NEW.created_at, NEW.updated_at);
                PERFORM dblink_exec(query);
            ELSIF TG_OP = 'UPDATE' THEN
                query := format('UPDATE activity_records SET user_id = %L, activity_type = %L, duration = %L, 
                             calories_burned = %L, date = %L, updated_at = %L WHERE id = %L',
                            NEW.user_id, NEW.activity_type, NEW.duration, NEW.calories_burned, 
                            NEW.date, NEW.updated_at, NEW.id);
                PERFORM dblink_exec(query);
            ELSIF TG_OP = 'DELETE' THEN
                query := format('DELETE FROM activity_records WHERE id = %L', OLD.id);
                PERFORM dblink_exec(query);
            END IF;
            
        WHEN 'wellbeing_records' THEN
            IF TG_OP = 'INSERT' THEN
                query := format('INSERT INTO wellbeing_records (id, user_id, mood, stress_level, energy_level, date, created_at, updated_at) 
                             VALUES (%L, %L, %L, %L, %L, %L, %L, %L)',
                            NEW.id, NEW.user_id, NEW.mood, NEW.stress_level, NEW.energy_level, 
                            NEW.date, NEW.created_at, NEW.updated_at);
                PERFORM dblink_exec(query);
            ELSIF TG_OP = 'UPDATE' THEN
                query := format('UPDATE wellbeing_records SET user_id = %L, mood = %L, stress_level = %L, 
                             energy_level = %L, date = %L, updated_at = %L WHERE id = %L',
                            NEW.user_id, NEW.mood, NEW.stress_level, NEW.energy_level, 
                            NEW.date, NEW.updated_at, NEW.id);
                PERFORM dblink_exec(query);
            ELSIF TG_OP = 'DELETE' THEN
                query := format('DELETE FROM wellbeing_records WHERE id = %L', OLD.id);
                PERFORM dblink_exec(query);
            END IF;
    END CASE;
    
    -- Закрываем соединение
    PERFORM dblink_disconnect();
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггеры для каждой таблицы
DROP TRIGGER IF EXISTS replicate_users ON users;
DROP TRIGGER IF EXISTS replicate_sleep_records ON sleep_records;
DROP TRIGGER IF EXISTS replicate_nutrition_records ON nutrition_records;
DROP TRIGGER IF EXISTS replicate_activity_records ON activity_records;
DROP TRIGGER IF EXISTS replicate_wellbeing_records ON wellbeing_records;

CREATE TRIGGER replicate_users
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION replicate_data();

CREATE TRIGGER replicate_sleep_records
    AFTER INSERT OR UPDATE OR DELETE ON sleep_records
    FOR EACH ROW EXECUTE FUNCTION replicate_data();

CREATE TRIGGER replicate_nutrition_records
    AFTER INSERT OR UPDATE OR DELETE ON nutrition_records
    FOR EACH ROW EXECUTE FUNCTION replicate_data();

CREATE TRIGGER replicate_activity_records
    AFTER INSERT OR UPDATE OR DELETE ON activity_records
    FOR EACH ROW EXECUTE FUNCTION replicate_data();

CREATE TRIGGER replicate_wellbeing_records
    AFTER INSERT OR UPDATE OR DELETE ON wellbeing_records
    FOR EACH ROW EXECUTE FUNCTION replicate_data(); 