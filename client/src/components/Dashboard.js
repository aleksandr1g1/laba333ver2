import React, { useState, useEffect, useCallback } from 'react';
import { Container, Grid, Paper, Typography, Box, CircularProgress, Alert, Divider } from '@mui/material';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  Title, 
  Tooltip, 
  Legend, 
  ArcElement
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Регистрируем компоненты Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Функция для получения данных с сервера
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get('/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStats(response.data);
    } catch (err) {
      console.error('Ошибка при получении данных дашборда:', err);
      setError('Не удалось загрузить статистику. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Функция для форматирования даты
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  // Подготовка данных для графика сна
  const prepareSleepData = () => {
    if (!stats || !stats.recent || !stats.recent.sleep || stats.recent.sleep.length === 0) {
      return null;
    }

    const labels = stats.recent.sleep.map(item => formatDate(item.date));
    
    return {
      labels,
      datasets: [
        {
          label: 'Качество сна',
          data: stats.recent.sleep.map(item => item.avg_quality),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
        },
        {
          label: 'Длительность (часов)',
          data: stats.recent.sleep.map(item => item.avg_duration),
          borderColor: 'rgba(153, 102, 255, 1)',
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
        }
      ]
    };
  };

  // Подготовка данных для графика питания
  const prepareNutritionData = () => {
    if (!stats || !stats.recent || !stats.recent.nutrition || stats.recent.nutrition.length === 0) {
      return null;
    }

    const labels = stats.recent.nutrition.map(item => formatDate(item.date));
    
    return {
      labels,
      datasets: [
        {
          label: 'Белки (г)',
          data: stats.recent.nutrition.map(item => item.avg_proteins),
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
        },
        {
          label: 'Жиры (г)',
          data: stats.recent.nutrition.map(item => item.avg_fats),
          borderColor: 'rgba(255, 206, 86, 1)',
          backgroundColor: 'rgba(255, 206, 86, 0.2)',
        },
        {
          label: 'Углеводы (г)',
          data: stats.recent.nutrition.map(item => item.avg_carbs),
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
        }
      ]
    };
  };

  // Подготовка данных для графика активности
  const prepareActivityData = () => {
    if (!stats || !stats.recent || !stats.recent.activity || stats.recent.activity.length === 0) {
      return null;
    }

    const labels = stats.recent.activity.map(item => formatDate(item.date));
    
    return {
      labels,
      datasets: [
        {
          label: 'Продолжительность (мин)',
          data: stats.recent.activity.map(item => item.avg_duration),
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          yAxisID: 'y',
        },
        {
          label: 'Интенсивность',
          data: stats.recent.activity.map(item => item.avg_intensity),
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          yAxisID: 'y1',
        }
      ]
    };
  };

  // Подготовка данных для графика самочувствия
  const prepareWellbeingData = () => {
    if (!stats || !stats.recent || !stats.recent.wellbeing || stats.recent.wellbeing.length === 0) {
      return null;
    }

    const labels = stats.recent.wellbeing.map(item => formatDate(item.date));
    
    return {
      labels,
      datasets: [
        {
          label: 'Настроение',
          data: stats.recent.wellbeing.map(item => item.avg_mood),
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
        },
        {
          label: 'Энергия',
          data: stats.recent.wellbeing.map(item => item.avg_energy),
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
        },
        {
          label: 'Стресс',
          data: stats.recent.wellbeing.map(item => item.avg_stress),
          borderColor: 'rgba(255, 206, 86, 1)',
          backgroundColor: 'rgba(255, 206, 86, 0.2)',
        }
      ]
    };
  };

  // Настройки для графиков
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  // Настройки для графика активности (две оси Y)
  const activityOptions = {
    ...options,
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Продолжительность (мин)'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Интенсивность'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  // Рендеринг содержимого или сообщения об отсутствии данных
  const renderChartOrMessage = (data, chartType, customOptions = options) => {
    if (!data) {
      return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="text.secondary">Нет данных для отображения</Typography>
        </Box>
      );
    }

    return (
      <Box sx={{ height: 300, p: 2 }}>
        {chartType === 'line' && <Line data={data} options={customOptions} />}
        {chartType === 'bar' && <Bar data={data} options={customOptions} />}
      </Box>
    );
  };

  // Функция форматирования даты для отображения
  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'Нет данных';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Подготовка данных за всё время для графика сна
  const prepareAllTimeSleepData = () => {
    if (!stats || !stats.allTime || !stats.allTime.sleep || !stats.allTime.sleep.byDate || stats.allTime.sleep.byDate.length === 0) {
      return null;
    }

    const dailyData = stats.allTime.sleep.byDate;
    const labels = dailyData.map(item => formatDate(item.date));
    
    return {
      labels,
      datasets: [
        {
          label: 'Качество сна',
          data: dailyData.map(item => item.avg_quality),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
        },
        {
          label: 'Длительность (часов)',
          data: dailyData.map(item => item.avg_duration),
          borderColor: 'rgba(153, 102, 255, 1)',
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
        }
      ]
    };
  };

  // Подготовка данных за всё время для графика питания
  const prepareAllTimeNutritionData = () => {
    if (!stats || !stats.allTime || !stats.allTime.nutrition || !stats.allTime.nutrition.byDate || stats.allTime.nutrition.byDate.length === 0) {
      return null;
    }

    const dailyData = stats.allTime.nutrition.byDate;
    const labels = dailyData.map(item => formatDate(item.date));
    
    return {
      labels,
      datasets: [
        {
          label: 'Белки (г)',
          data: dailyData.map(item => item.avg_proteins),
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
        },
        {
          label: 'Жиры (г)',
          data: dailyData.map(item => item.avg_fats),
          borderColor: 'rgba(255, 206, 86, 1)',
          backgroundColor: 'rgba(255, 206, 86, 0.2)',
        },
        {
          label: 'Углеводы (г)',
          data: dailyData.map(item => item.avg_carbs),
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
        }
      ]
    };
  };

  // Подготовка данных за всё время для графика активности
  const prepareAllTimeActivityData = () => {
    if (!stats || !stats.allTime || !stats.allTime.activity || !stats.allTime.activity.byDate || stats.allTime.activity.byDate.length === 0) {
      return null;
    }

    const dailyData = stats.allTime.activity.byDate;
    const labels = dailyData.map(item => formatDate(item.date));
    
    return {
      labels,
      datasets: [
        {
          label: 'Продолжительность (мин)',
          data: dailyData.map(item => item.avg_duration),
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          yAxisID: 'y',
        },
        {
          label: 'Интенсивность',
          data: dailyData.map(item => item.avg_intensity),
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          yAxisID: 'y1',
        }
      ]
    };
  };

  // Подготовка данных за всё время для графика самочувствия
  const prepareAllTimeWellbeingData = () => {
    if (!stats || !stats.allTime || !stats.allTime.wellbeing || !stats.allTime.wellbeing.byDate || stats.allTime.wellbeing.byDate.length === 0) {
      return null;
    }

    const dailyData = stats.allTime.wellbeing.byDate;
    const labels = dailyData.map(item => formatDate(item.date));
    
    return {
      labels,
      datasets: [
        {
          label: 'Настроение',
          data: dailyData.map(item => item.avg_mood),
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
        },
        {
          label: 'Энергия',
          data: dailyData.map(item => item.avg_energy),
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
        },
        {
          label: 'Стресс',
          data: dailyData.map(item => item.avg_stress),
          borderColor: 'rgba(255, 206, 86, 1)',
          backgroundColor: 'rgba(255, 206, 86, 0.2)',
        }
      ]
    };
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Средние показатели за все время'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  // Анализ данных и рекомендации
  const getUserAnalysis = () => {
    if (!stats || !stats.recent) {
      return null;
    }

    const analysis = {
      sleep: {
        hasIssue: false,
        message: '',
        recommendation: ''
      },
      nutrition: {
        hasIssue: false,
        message: '',
        recommendation: ''
      },
      activity: {
        hasIssue: false,
        message: '',
        recommendation: ''
      },
      wellbeing: {
        hasIssue: false,
        message: '',
        recommendation: ''
      }
    };

    // Анализ сна
    if (stats.recent.sleep && stats.recent.sleep.length > 0) {
      const avgSleepQuality = stats.recent.sleep.reduce((sum, record) => sum + parseFloat(record.avg_quality || 0), 0) / stats.recent.sleep.length;
      const avgSleepDuration = stats.recent.sleep.reduce((sum, record) => sum + parseFloat(record.avg_duration || 0), 0) / stats.recent.sleep.length;
      
      if (avgSleepDuration < 7) {
        analysis.sleep.hasIssue = true;
        analysis.sleep.message = `Недостаточная продолжительность сна (${avgSleepDuration.toFixed(1)} ч/день)`;
        analysis.sleep.recommendation = 'Рекомендуется спать 7-9 часов в сутки. Попробуйте ложиться раньше и создать комфортные условия для сна.';
      }
      
      if (avgSleepQuality < 3.5) {
        analysis.sleep.hasIssue = true;
        analysis.sleep.message = analysis.sleep.message 
          ? `${analysis.sleep.message} и низкое качество сна (${avgSleepQuality.toFixed(1)}/5)`
          : `Низкое качество сна (${avgSleepQuality.toFixed(1)}/5)`;
        analysis.sleep.recommendation = analysis.sleep.recommendation 
          ? `${analysis.sleep.recommendation} Улучшите качество сна: ограничьте использование электронных устройств перед сном, проветривайте комнату.`
          : 'Улучшите качество сна: ограничьте использование электронных устройств перед сном, проветривайте комнату.';
      }
    }

    // Анализ питания
    if (stats.recent.nutrition && stats.recent.nutrition.length > 0) {
      const avgProteins = stats.recent.nutrition.reduce((sum, record) => sum + parseFloat(record.avg_proteins || 0), 0) / stats.recent.nutrition.length;
      const avgFats = stats.recent.nutrition.reduce((sum, record) => sum + parseFloat(record.avg_fats || 0), 0) / stats.recent.nutrition.length;
      const avgCarbs = stats.recent.nutrition.reduce((sum, record) => sum + parseFloat(record.avg_carbs || 0), 0) / stats.recent.nutrition.length;
      
      if (avgProteins < 50) {
        analysis.nutrition.hasIssue = true;
        analysis.nutrition.message = `Недостаточное потребление белка (${avgProteins.toFixed(1)} г/день)`;
        analysis.nutrition.recommendation = 'Увеличьте потребление белка: включите в рацион больше мяса, рыбы, яиц, молочных продуктов или растительных источников белка.';
      }
      
      if (avgFats > 70) {
        analysis.nutrition.hasIssue = true;
        analysis.nutrition.message = analysis.nutrition.message 
          ? `${analysis.nutrition.message} и избыточное потребление жиров (${avgFats.toFixed(1)} г/день)`
          : `Избыточное потребление жирной пищи, жареных блюд и фастфуда.`;
        analysis.nutrition.recommendation = analysis.nutrition.recommendation 
          ? `${analysis.nutrition.recommendation} Уменьшите потребление жирной пищи, жареных блюд и фастфуда.`
          : 'Уменьшите потребление жирной пищи, жареных блюд и фастфуда.';
      }
    }

    // Анализ активности
    if (stats.recent.activity && stats.recent.activity.length > 0) {
      const avgDuration = stats.recent.activity.reduce((sum, record) => sum + parseFloat(record.avg_duration || 0), 0) / stats.recent.activity.length;
      const avgIntensity = stats.recent.activity.reduce((sum, record) => sum + parseFloat(record.avg_intensity || 0), 0) / stats.recent.activity.length;
      
      if (avgDuration < 30) {
        analysis.activity.hasIssue = true;
        analysis.activity.message = `Недостаточная продолжительность активности (${avgDuration.toFixed(1)} мин/день)`;
        analysis.activity.recommendation = 'Рекомендуется минимум 30 минут умеренной активности в день. Попробуйте ходить пешком, заниматься йогой или другими видами спорта.';
      }
      
      if (avgIntensity < 3) {
        analysis.activity.hasIssue = true;
        analysis.activity.message = analysis.activity.message 
          ? `${analysis.activity.message} и низкая интенсивность (${avgIntensity.toFixed(1)}/5)`
          : `Низкая интенсивность активности (${avgIntensity.toFixed(1)}/5)`;
        analysis.activity.recommendation = analysis.activity.recommendation 
          ? `${analysis.activity.recommendation} Попробуйте добавить более интенсивные тренировки 2-3 раза в неделю.`
          : 'Попробуйте добавить более интенсивные тренировки 2-3 раза в неделю.';
      }
    }

    // Анализ самочувствия
    if (stats.recent.wellbeing && stats.recent.wellbeing.length > 0) {
      const avgMood = stats.recent.wellbeing.reduce((sum, record) => sum + parseFloat(record.avg_mood || 0), 0) / stats.recent.wellbeing.length;
      const avgEnergy = stats.recent.wellbeing.reduce((sum, record) => sum + parseFloat(record.avg_energy || 0), 0) / stats.recent.wellbeing.length;
      const avgStress = stats.recent.wellbeing.reduce((sum, record) => sum + parseFloat(record.avg_stress || 0), 0) / stats.recent.wellbeing.length;
      
      if (avgMood < 3.5) {
        analysis.wellbeing.hasIssue = true;
        analysis.wellbeing.message = `Пониженное настроение (${avgMood.toFixed(1)}/5)`;
        analysis.wellbeing.recommendation = 'Попробуйте уделить время занятиям, которые приносят вам радость, общайтесь с близкими людьми, уделите время хобби.';
      }
      
      if (avgEnergy < 3) {
        analysis.wellbeing.hasIssue = true;
        analysis.wellbeing.message = analysis.wellbeing.message 
          ? `${analysis.wellbeing.message} и низкий уровень энергии (${avgEnergy.toFixed(1)}/5)`
          : `Низкий уровень энергии (${avgEnergy.toFixed(1)}/5)`;
        analysis.wellbeing.recommendation = analysis.wellbeing.recommendation 
          ? `${analysis.wellbeing.recommendation} Для повышения энергии регулярно высыпайтесь, занимайтесь спортом и правильно питайтесь.`
          : 'Для повышения энергии регулярно высыпайтесь, занимайтесь спортом и правильно питайтесь.';
      }
      
      if (avgStress > 3.5) {
        analysis.wellbeing.hasIssue = true;
        analysis.wellbeing.message = analysis.wellbeing.message 
          ? `${analysis.wellbeing.message} и повышенный уровень стресса (${avgStress.toFixed(1)}/5)`
          : `Повышенный уровень стресса (${avgStress.toFixed(1)}/5)`;
        analysis.wellbeing.recommendation = analysis.wellbeing.recommendation 
          ? `${analysis.wellbeing.recommendation} Для снижения стресса попробуйте методики релаксации, медитацию, дыхательные упражнения.`
          : 'Для снижения стресса попробуйте методики релаксации, медитацию, дыхательные упражнения.';
      }
    }

    return analysis;
  };

  // Компонент для отображения анализа
  const AnalysisItem = ({ title, hasIssue, message, recommendation }) => {
    if (!hasIssue) {
      return (
        <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'success.light' }}>
          <Typography variant="h6">{title}</Typography>
          <Typography variant="body1">Показатели в норме. Продолжайте в том же духе!</Typography>
        </Paper>
      );
    }
    
    return (
      <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'warning.light' }}>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body1" sx={{ mb: 1 }}><strong>Проблема:</strong> {message}</Typography>
        <Typography variant="body1"><strong>Рекомендация:</strong> {recommendation}</Typography>
      </Paper>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Дашборд
      </Typography>
      
      <Grid container spacing={3}>
        {/* Статистика записей за 7 дней */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Статистика за последние 7 дней
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h4">{stats?.recent?.summary?.sleepCount || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Записей о сне
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h4">{stats?.recent?.summary?.nutritionCount || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Записей о питании
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h4">{stats?.recent?.summary?.activityCount || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Записей об активности
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center">
                  <Typography variant="h4">{stats?.recent?.summary?.wellbeingCount || 0}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Записей о самочувствии
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Статистика за все время */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Общая статистика за все время
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Первая запись: {formatDisplayDate(stats?.allTime?.summary?.firstRecordDate)}
              </Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Box textAlign="center">
                        <Typography variant="h4">{stats?.allTime?.summary?.sleepCount || 0}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Записей о сне
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box textAlign="center">
                        <Typography variant="h4">{stats?.allTime?.summary?.nutritionCount || 0}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Записей о питании
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box textAlign="center">
                        <Typography variant="h4">{stats?.allTime?.summary?.activityCount || 0}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Записей об активности
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box textAlign="center">
                        <Typography variant="h4">{stats?.allTime?.summary?.wellbeingCount || 0}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Записей о самочувствии
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>Средние показатели:</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Сон:</strong> Качество: {parseFloat(stats?.allTime?.sleep?.avg_quality || 0).toFixed(1)}/5, 
                        Длительность: {parseFloat(stats?.allTime?.sleep?.avg_duration || 0).toFixed(1)} ч
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Питание:</strong> Белки: {parseFloat(stats?.allTime?.nutrition?.avg_proteins || 0).toFixed(1)} г, 
                        Жиры: {parseFloat(stats?.allTime?.nutrition?.avg_fats || 0).toFixed(1)} г, 
                        Углеводы: {parseFloat(stats?.allTime?.nutrition?.avg_carbs || 0).toFixed(1)} г
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Активность:</strong> Длительность: {parseFloat(stats?.allTime?.activity?.avg_duration || 0).toFixed(1)} мин, 
                        Интенсивность: {parseFloat(stats?.allTime?.activity?.avg_intensity || 0).toFixed(1)}/5
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Самочувствие:</strong> Настроение: {parseFloat(stats?.allTime?.wellbeing?.avg_mood || 0).toFixed(1)}/5, 
                        Энергия: {parseFloat(stats?.allTime?.wellbeing?.avg_energy || 0).toFixed(1)}/5, 
                        Стресс: {parseFloat(stats?.allTime?.wellbeing?.avg_stress || 0).toFixed(1)}/5
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Графики за 7 дней */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
            Графики за последние 7 дней
          </Typography>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Сон</Typography>
              {renderChartOrMessage(prepareSleepData(), 'line')}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Питание</Typography>
              {renderChartOrMessage(prepareNutritionData(), 'line')}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Активность</Typography>
              {renderChartOrMessage(prepareActivityData(), 'line', activityOptions)}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Самочувствие</Typography>
              {renderChartOrMessage(prepareWellbeingData(), 'line')}
            </Paper>
          </Grid>
        </Grid>

        {/* Анализ данных и рекомендации */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Анализ ваших показателей за последние 7 дней
          </Typography>
          
          {stats && stats.recent ? (
            <Box sx={{ mt: 2 }}>
              {getUserAnalysis() && (
                <>
                  <AnalysisItem 
                    title="Сон" 
                    hasIssue={getUserAnalysis().sleep.hasIssue} 
                    message={getUserAnalysis().sleep.message} 
                    recommendation={getUserAnalysis().sleep.recommendation} 
                  />
                  <AnalysisItem 
                    title="Питание" 
                    hasIssue={getUserAnalysis().nutrition.hasIssue} 
                    message={getUserAnalysis().nutrition.message} 
                    recommendation={getUserAnalysis().nutrition.recommendation} 
                  />
                  <AnalysisItem 
                    title="Активность" 
                    hasIssue={getUserAnalysis().activity.hasIssue} 
                    message={getUserAnalysis().activity.message} 
                    recommendation={getUserAnalysis().activity.recommendation} 
                  />
                  <AnalysisItem 
                    title="Самочувствие" 
                    hasIssue={getUserAnalysis().wellbeing.hasIssue} 
                    message={getUserAnalysis().wellbeing.message} 
                    recommendation={getUserAnalysis().wellbeing.recommendation} 
                  />
                </>
              )}
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary">
              Недостаточно данных для анализа. Добавьте записи за последние 7 дней.
            </Typography>
          )}
        </Grid>

        {/* Графики за все время */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Графики за все время использования
          </Typography>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Сон (все время)</Typography>
              {renderChartOrMessage(prepareAllTimeSleepData(), 'line')}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Питание (все время)</Typography>
              {renderChartOrMessage(prepareAllTimeNutritionData(), 'line')}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Активность (все время)</Typography>
              {renderChartOrMessage(prepareAllTimeActivityData(), 'line', activityOptions)}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Самочувствие (все время)</Typography>
              {renderChartOrMessage(prepareAllTimeWellbeingData(), 'line')}
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 