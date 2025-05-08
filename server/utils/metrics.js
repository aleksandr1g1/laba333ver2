const client = require('prom-client');
const logger = require('./logger').logger;

// Создаем реестр метрик
const register = new client.Registry();

// Добавляем дефолтные метрики
client.collectDefaultMetrics({ register });

// HTTP запросы счетчик
const httpRequestsCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'service'],
  registers: [register],
});

// Время выполнения запросов
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'service'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register],
});

// Health метрики по сервисам
const serviceHealth = new client.Gauge({
  name: 'service_health_status',
  help: 'Health status of the service (1 = up, 0 = down)',
  labelNames: ['service'],
  registers: [register],
});

// Инициализируем счетчики здоровья для сервисов
const initServiceHealth = () => {
  // Основные сервисы
  serviceHealth.set({ service: 'auth' }, 1);
  serviceHealth.set({ service: 'dashboard' }, 1);
  serviceHealth.set({ service: 'sleep' }, 1);
  serviceHealth.set({ service: 'nutrition' }, 1);
  serviceHealth.set({ service: 'activity' }, 1);
  serviceHealth.set({ service: 'wellbeing' }, 1);
  
  logger.info('Service health metrics initialized');
};

// Middleware для обработки метрик HTTP-запросов
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  const service = getServiceFromUrl(req.originalUrl);
  
  // Обработчик окончания запроса
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000; // в секундах
    
    // Увеличиваем счетчик запросов
    httpRequestsCounter.inc({
      method: req.method,
      route: req.route ? req.route.path : req.originalUrl,
      status_code: res.statusCode,
      service,
    });
    
    // Записываем время выполнения
    httpRequestDuration.observe(
      {
        method: req.method,
        route: req.route ? req.route.path : req.originalUrl,
        service,
      },
      duration
    );
  });
  
  next();
};

// Функция для определения сервиса по URL
function getServiceFromUrl(url) {
  if (url.startsWith('/api/auth')) return 'auth';
  if (url.startsWith('/api/dashboard')) return 'dashboard';
  if (url.startsWith('/api/sleep')) return 'sleep';
  if (url.startsWith('/api/nutrition')) return 'nutrition';
  if (url.startsWith('/api/activity')) return 'activity';
  if (url.startsWith('/api/wellbeing')) return 'wellbeing';
  return 'other';
}

// Функция для проверки и обновления статуса здоровья сервиса
function updateServiceHealth(service, isHealthy) {
  serviceHealth.set({ service }, isHealthy ? 1 : 0);
  logger.info(`Service ${service} health status updated: ${isHealthy ? 'up' : 'down'}`);
}

module.exports = {
  register,
  httpRequestsCounter,
  httpRequestDuration,
  serviceHealth,
  metricsMiddleware,
  initServiceHealth,
  updateServiceHealth,
}; 