import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Компонент для отображения метрик
const MetricsProxy = () => {
  const [metricsData, setMetricsData] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        // Обращаемся к API сервера для получения метрик
        const response = await axios.get('http://localhost:3002/api/metrics');
        setMetricsData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching metrics:', err);
        setError('Не удалось загрузить метрики. Убедитесь, что сервер API запущен на порту 3002.');
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return <div>Загрузка метрик...</div>;
  }

  if (error) {
    return (
      <div style={{ color: 'red', padding: '20px' }}>
        <h2>Ошибка</h2>
        <p>{error}</p>
        <p>
          Попробуйте открыть метрики напрямую по адресу:
          <a href="http://localhost:3002/api/metrics" target="_blank" rel="noopener noreferrer">
            http://localhost:3002/api/metrics
          </a>
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Метрики системы</h2>
      <pre style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '5px',
        whiteSpace: 'pre-wrap',
        maxHeight: '500px',
        overflow: 'auto' 
      }}>
        {typeof metricsData === 'string' ? metricsData : JSON.stringify(metricsData, null, 2)}
      </pre>
    </div>
  );
};

export default MetricsProxy; 