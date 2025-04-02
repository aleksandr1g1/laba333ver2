import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Slider,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { ru } from 'date-fns/locale';

// Пример данных о типах активности
const activityTypes = [
  { id: 1, name: 'Бег', caloriesPerMinute: 10 },
  { id: 2, name: 'Ходьба', caloriesPerMinute: 4 },
  { id: 3, name: 'Плавание', caloriesPerMinute: 8 },
  { id: 4, name: 'Велосипед', caloriesPerMinute: 7 },
  { id: 5, name: 'Силовая тренировка', caloriesPerMinute: 6 },
];

function ActivityTracker() {
  const [selectedActivity, setSelectedActivity] = useState('');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState(5);
  const [activityTime, setActivityTime] = useState(null);
  const [activities, setActivities] = useState([]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const activity = activityTypes.find(a => a.name === selectedActivity);
    if (activity) {
      const caloriesBurned = Math.round(
        activity.caloriesPerMinute * parseFloat(duration) * (intensity / 5)
      );
      const newActivity = {
        id: Date.now(),
        type: activity.name,
        duration: parseFloat(duration),
        intensity,
        caloriesBurned,
        time: activityTime,
      };
      setActivities([...activities, newActivity]);
      setSelectedActivity('');
      setDuration('');
      setIntensity(5);
      setActivityTime(null);
    }
  };

  const handleDelete = (id) => {
    setActivities(activities.filter(activity => activity.id !== id));
  };

  const totalDuration = activities.reduce((sum, activity) => sum + activity.duration, 0);
  const totalCalories = activities.reduce((sum, activity) => sum + activity.caloriesBurned, 0);
  const averageIntensity = activities.length > 0
    ? activities.reduce((sum, activity) => sum + activity.intensity, 0) / activities.length
    : 0;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Отслеживание физической активности
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Добавить активность
            </Typography>
            <form onSubmit={handleSubmit}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label="Тип активности"
                      value={selectedActivity}
                      onChange={(e) => setSelectedActivity(e.target.value)}
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option value="">Выберите тип активности</option>
                      {activityTypes.map((activity) => (
                        <option key={activity.id} value={activity.name}>
                          {activity.name}
                        </option>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Продолжительность (минуты)"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography gutterBottom>Интенсивность</Typography>
                    <Slider
                      value={intensity}
                      onChange={(event, newValue) => setIntensity(newValue)}
                      min={1}
                      max={10}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <DateTimePicker
                      label="Время активности"
                      value={activityTime}
                      onChange={setActivityTime}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={!selectedActivity || !duration || !activityTime}
                    >
                      Добавить
                    </Button>
                  </Grid>
                </Grid>
              </LocalizationProvider>
            </form>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Статистика за день
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Общее время
                  </Typography>
                  <Typography variant="h4">{Math.round(totalDuration)} мин</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Сожжено калорий
                  </Typography>
                  <Typography variant="h4">{totalCalories}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Средняя интенсивность
                  </Typography>
                  <Typography variant="h4">{Math.round(averageIntensity)}/10</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Активностей
                  </Typography>
                  <Typography variant="h4">{activities.length}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Время</TableCell>
                  <TableCell>Тип активности</TableCell>
                  <TableCell align="right">Продолжительность (мин)</TableCell>
                  <TableCell align="right">Интенсивность</TableCell>
                  <TableCell align="right">Калории</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      {activity.time?.toLocaleTimeString()}
                    </TableCell>
                    <TableCell>{activity.type}</TableCell>
                    <TableCell align="right">{activity.duration}</TableCell>
                    <TableCell align="right">{activity.intensity}/10</TableCell>
                    <TableCell align="right">{activity.caloriesBurned}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(activity.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ActivityTracker; 