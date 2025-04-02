-- Функция для репликации данных
CREATE OR REPLACE FUNCTION replicate_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Подключаемся к базе данных для чтения
    PERFORM dblink_connect('dbname=health_tracker_read user=health_tracker password=health_tracker host=localhost port=5432');
    
    -- В зависимости от таблицы, выполняем соответствующую операцию
    CASE TG_TABLE_NAME
        WHEN 'users' THEN
            IF TG_OP = 'INSERT' THEN
                PERFORM dblink_exec('INSERT INTO users (id, email, password_hash, created_at, updated_at)
                                  VALUES ($1, $2, $3, $4, $5)',
                                  NEW.id, NEW.email, NEW.password_hash, NEW.created_at, NEW.updated_at);
            ELSIF TG_OP = 'UPDATE' THEN
                PERFORM dblink_exec('UPDATE users SET email = $1, password_hash = $2, updated_at = $3
                                  WHERE id = $4',
                                  NEW.email, NEW.password_hash, NEW.updated_at, NEW.id);
            ELSIF TG_OP = 'DELETE' THEN
                PERFORM dblink_exec('DELETE FROM users WHERE id = $1', OLD.id);
            END IF;
            
        WHEN 'sleep_records' THEN
            IF TG_OP = 'INSERT' THEN
                PERFORM dblink_exec('INSERT INTO sleep_records (id, user_id, sleep_duration, quality, date, created_at, updated_at)
                                  VALUES ($1, $2, $3, $4, $5, $6, $7)',
                                  NEW.id, NEW.user_id, NEW.sleep_duration, NEW.quality, NEW.date, NEW.created_at, NEW.updated_at);
            ELSIF TG_OP = 'UPDATE' THEN
                PERFORM dblink_exec('UPDATE sleep_records SET user_id = $1, sleep_duration = $2, quality = $3,
                                  date = $4, updated_at = $5 WHERE id = $6',
                                  NEW.user_id, NEW.sleep_duration, NEW.quality, NEW.date, NEW.updated_at, NEW.id);
            ELSIF TG_OP = 'DELETE' THEN
                PERFORM dblink_exec('DELETE FROM sleep_records WHERE id = $1', OLD.id);
            END IF;
            
        WHEN 'nutrition_records' THEN
            IF TG_OP = 'INSERT' THEN
                PERFORM dblink_exec('INSERT INTO nutrition_records (id, user_id, meal_type, calories, date, created_at, updated_at)
                                  VALUES ($1, $2, $3, $4, $5, $6, $7)',
                                  NEW.id, NEW.user_id, NEW.meal_type, NEW.calories, NEW.date, NEW.created_at, NEW.updated_at);
            ELSIF TG_OP = 'UPDATE' THEN
                PERFORM dblink_exec('UPDATE nutrition_records SET user_id = $1, meal_type = $2, calories = $3,
                                  date = $4, updated_at = $5 WHERE id = $6',
                                  NEW.user_id, NEW.meal_type, NEW.calories, NEW.date, NEW.updated_at, NEW.id);
            ELSIF TG_OP = 'DELETE' THEN
                PERFORM dblink_exec('DELETE FROM nutrition_records WHERE id = $1', OLD.id);
            END IF;
            
        WHEN 'activity_records' THEN
            IF TG_OP = 'INSERT' THEN
                PERFORM dblink_exec('INSERT INTO activity_records (id, user_id, activity_type, duration, calories_burned, date, created_at, updated_at)
                                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                                  NEW.id, NEW.user_id, NEW.activity_type, NEW.duration, NEW.calories_burned, NEW.date, NEW.created_at, NEW.updated_at);
            ELSIF TG_OP = 'UPDATE' THEN
                PERFORM dblink_exec('UPDATE activity_records SET user_id = $1, activity_type = $2, duration = $3,
                                  calories_burned = $4, date = $5, updated_at = $6 WHERE id = $7',
                                  NEW.user_id, NEW.activity_type, NEW.duration, NEW.calories_burned, NEW.date, NEW.updated_at, NEW.id);
            ELSIF TG_OP = 'DELETE' THEN
                PERFORM dblink_exec('DELETE FROM activity_records WHERE id = $1', OLD.id);
            END IF;
            
        WHEN 'wellbeing_records' THEN
            IF TG_OP = 'INSERT' THEN
                PERFORM dblink_exec('INSERT INTO wellbeing_records (id, user_id, mood, stress_level, energy_level, date, created_at, updated_at)
                                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
                                  NEW.id, NEW.user_id, NEW.mood, NEW.stress_level, NEW.energy_level, NEW.date, NEW.created_at, NEW.updated_at);
            ELSIF TG_OP = 'UPDATE' THEN
                PERFORM dblink_exec('UPDATE wellbeing_records SET user_id = $1, mood = $2, stress_level = $3,
                                  energy_level = $4, date = $5, updated_at = $6 WHERE id = $7',
                                  NEW.user_id, NEW.mood, NEW.stress_level, NEW.energy_level, NEW.date, NEW.updated_at, NEW.id);
            ELSIF TG_OP = 'DELETE' THEN
                PERFORM dblink_exec('DELETE FROM wellbeing_records WHERE id = $1', OLD.id);
            END IF;
    END CASE;
    
    -- Закрываем соединение
    PERFORM dblink_disconnect();
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Создаем триггеры для каждой таблицы
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