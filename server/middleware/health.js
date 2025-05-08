const { updateServiceHealth } = require('../utils/metrics');
const { logger } = require('../utils/logger');
const { readPool, writePool } = require('../db/init');
const { admin } = require('../kafka');

// Middleware для проверки здоровья сервиса Auth
const authHealthCheck = async (req, res, next) => {
  try {
    // Проверяем соединение с БД
    await readPool.query('SELECT 1');
    updateServiceHealth('auth', true);
    next();
  } catch (error) {
    logger.error(`Auth service health check failed: ${error}`);
    updateServiceHealth('auth', false);
    next();
  }
};

// Middleware для проверки здоровья Dashboard
const dashboardHealthCheck = async (req, res, next) => {
  try {
    // Проверяем соединение с read базой данных
    await readPool.query('SELECT 1');
    updateServiceHealth('dashboard', true);
    next();
  } catch (error) {
    logger.error(`Dashboard service health check failed: ${error}`);
    updateServiceHealth('dashboard', false);
    next();
  }
};

// Middleware для проверки здоровья Sleep сервиса
const sleepHealthCheck = async (req, res, next) => {
  try {
    // Проверяем соединение с БД для сна
    await readPool.query('SELECT COUNT(*) FROM sleep_records LIMIT 1');
    updateServiceHealth('sleep', true);
    next();
  } catch (error) {
    logger.error(`Sleep service health check failed: ${error}`);
    updateServiceHealth('sleep', false);
    next();
  }
};

// Middleware для проверки здоровья Nutrition сервиса
const nutritionHealthCheck = async (req, res, next) => {
  try {
    // Проверяем соединение с БД для питания
    await readPool.query('SELECT COUNT(*) FROM nutrition_records LIMIT 1');
    updateServiceHealth('nutrition', true);
    next();
  } catch (error) {
    logger.error(`Nutrition service health check failed: ${error}`);
    updateServiceHealth('nutrition', false);
    next();
  }
};

// Middleware для проверки здоровья Activity сервиса
const activityHealthCheck = async (req, res, next) => {
  try {
    // Проверяем соединение с БД для активности
    await readPool.query('SELECT COUNT(*) FROM activity_records LIMIT 1');
    updateServiceHealth('activity', true);
    next();
  } catch (error) {
    logger.error(`Activity service health check failed: ${error}`);
    updateServiceHealth('activity', false);
    next();
  }
};

// Middleware для проверки здоровья Wellbeing сервиса
const wellbeingHealthCheck = async (req, res, next) => {
  try {
    // Проверяем соединение с БД для самочувствия
    await readPool.query('SELECT COUNT(*) FROM wellbeing_records LIMIT 1');
    updateServiceHealth('wellbeing', true);
    next();
  } catch (error) {
    logger.error(`Wellbeing service health check failed: ${error}`);
    updateServiceHealth('wellbeing', false);
    next();
  }
};

module.exports = {
  authHealthCheck,
  dashboardHealthCheck,
  sleepHealthCheck,
  nutritionHealthCheck,
  activityHealthCheck,
  wellbeingHealthCheck
}; 