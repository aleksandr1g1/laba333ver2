import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Компонент для отображения статуса здоровья системы
const HealthProxy = () => {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        setLoading(true);
        // Обращаемся к API сервера для получения статуса здоровья
        const response = await axios.get('http://localhost:3002/api/health');
        setHealthData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching health status:', err);
        setError('Не удалось загрузить статус здоровья. Убедитесь, что сервер API запущен на порту 3002.');
        setLoading(false);
      }
    };

    fetchHealth();
  }, []);

  if (loading) {
    return <div>Загрузка статуса здоровья...</div>;
  }

  if (error) {
    return (
      <div style={{ color: 'red', padding: '20px' }}>
        <h2>Ошибка</h2>
        <p>{error}</p>
        <p>
          Попробуйте открыть статус здоровья напрямую по адресу:
          <a href="http://localhost:3002/api/health" target="_blank" rel="noopener noreferrer">
            http://localhost:3002/api/health
          </a>
        </p>
      </div>
    );
  }

  // Выбор цвета в зависимости от статуса
  const getStatusColor = (status) => {
    switch (status) {
      case 'ok': return 'green';
      case 'degraded': return 'orange';
      case 'error': return 'red';
      default: return 'grey';
    }
  };

  // Выбор цвета для сервиса
  const getServiceColor = (status) => {
    return status === 'up' ? 'green' : 'red';
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Статус здоровья системы</h2>
      
      {healthData && (
        <div>
          <div style={{ 
            backgroundColor: getStatusColor(healthData.status), 
            color: 'white', 
            padding: '10px', 
            borderRadius: '5px',
            marginBottom: '15px',
            display: 'inline-block'
          }}>
            Общий статус: {healthData.status.toUpperCase()}
          </div>
          
          <h3>Статус сервисов:</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            {Object.entries(healthData.services).map(([service, status]) => (
              <div 
                key={service}
                style={{ 
                  backgroundColor: getServiceColor(status), 
                  color: 'white', 
                  padding: '10px', 
                  borderRadius: '5px',
                  minWidth: '150px'
                }}
              >
                {service}: {status.toUpperCase()}
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: '15px' }}>
            Последнее обновление: {new Date(healthData.timestamp).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthProxy; 