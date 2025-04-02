import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
} from '@mui/material';
import {
  Bedtime as SleepIcon,
  Restaurant as NutritionIcon,
  FitnessCenter as ActivityIcon,
  SentimentSatisfied as WellbeingIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Пример данных для графиков
const sleepData = [
  { date: '2024-01-01', duration: 7.5, quality: 8 },
  { date: '2024-01-02', duration: 8, quality: 9 },
  { date: '2024-01-03', duration: 7, quality: 7 },
  { date: '2024-01-04', duration: 8.5, quality: 8 },
  { date: '2024-01-05', duration: 7.5, quality: 9 },
];

const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {icon}
        <Typography variant="h6" component="div" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" color={color}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

function Dashboard() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Обзор здоровья
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Средняя продолжительность сна"
            value="7.7 ч"
            icon={<SleepIcon color="primary" />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Калории за сегодня"
            value="2100"
            icon={<NutritionIcon color="secondary" />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Активность за неделю"
            value="4.5 ч"
            icon={<ActivityIcon color="success" />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Уровень самочувствия"
            value="8/10"
            icon={<WellbeingIcon color="warning" />}
            color="warning.main"
          />
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Качество сна за последние 5 дней
            </Typography>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sleepData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="duration"
                    stroke="#8884d8"
                    name="Продолжительность (часы)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="quality"
                    stroke="#82ca9d"
                    name="Качество (1-10)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard; 