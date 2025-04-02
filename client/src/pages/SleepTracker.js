import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Slider,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { ru } from 'date-fns/locale';

function SleepTracker() {
  const [sleepTime, setSleepTime] = useState(null);
  const [wakeTime, setWakeTime] = useState(null);
  const [quality, setQuality] = useState(5);
  const [notes, setNotes] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    // Здесь будет логика отправки данных на сервер
    console.log({
      sleepTime,
      wakeTime,
      quality,
      notes,
    });
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Отслеживание сна
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Добавить запись о сне
            </Typography>
            <form onSubmit={handleSubmit}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <DateTimePicker
                      label="Время отхода ко сну"
                      value={sleepTime}
                      onChange={setSleepTime}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <DateTimePicker
                      label="Время пробуждения"
                      value={wakeTime}
                      onChange={setWakeTime}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography gutterBottom>Качество сна</Typography>
                    <Slider
                      value={quality}
                      onChange={(event, newValue) => setQuality(newValue)}
                      min={1}
                      max={10}
                      marks
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Заметки"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                    >
                      Сохранить
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
                Статистика сна
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Средняя продолжительность
                  </Typography>
                  <Typography variant="h4">7.5 ч</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Среднее качество
                  </Typography>
                  <Typography variant="h4">8/10</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Рекомендуемая норма
                  </Typography>
                  <Typography variant="h4">8 ч</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Записей за неделю
                  </Typography>
                  <Typography variant="h4">5</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default SleepTracker; 