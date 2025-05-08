const express = require('express');
const router = express.Router();
const { register } = require('../utils/metrics');
const { authenticateToken } = require('../middleware/auth');
const { logger } = require('../utils/logger');

// Эндпоинт для получения метрик Prometheus
router.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    logger.error(`Error generating metrics: ${error}`);
    res.status(500).send(`Error generating metrics: ${error}`);
  }
});

// Эндпоинт для проверки общего состояния системы
router.get('/health', async (req, res) => {
  try {
    const metricsData = await register.getMetricsAsJSON();
    
    // Получаем все метрики health
    const healthMetrics = metricsData.filter(metric => 
      metric.name === 'service_health_status'
    );
    
    if (!healthMetrics.length) {
      return res.status(500).json({ status: 'error', message: 'Health metrics not found' });
    }
    
    // Получаем значения health для всех сервисов
    const serviceStatuses = {};
    healthMetrics[0].values.forEach(value => {
      serviceStatuses[value.labels.service] = value.value === 1 ? 'up' : 'down';
    });
    
    // Если хотя бы один сервис не работает, считаем систему частично недоступной
    const anyServiceDown = Object.values(serviceStatuses).includes('down');
    
    res.json({
      status: anyServiceDown ? 'degraded' : 'ok',
      services: serviceStatuses,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error(`Error checking health: ${error}`);
    res.status(500).json({ 
      status: 'error', 
      message: `Error checking health: ${error.message}` 
    });
  }
});

module.exports = router; 