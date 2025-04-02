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

function WellbeingTracker() {
  const [moodScore, setMoodScore] = useState(5);
  const [energyLevel, setEnergyLevel] = useState(5);
  const [stressLevel, setStressLevel] = useState(5);
  const [notes, setNotes] = useState('');
  const [recordTime, setRecordTime] = useState(null);
  const [records, setRecords] = useState([]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const newRecord = {
      id: Date.now(),
      moodScore,
      energyLevel,
      stressLevel,
      notes,
      time: recordTime,
    };
    setRecords([...records, newRecord]);
    setMoodScore(5);
    setEnergyLevel(5);
    setStressLevel(5);
    setNotes('');
    setRecordTime(null);
  };

  const handleDelete = (id) => {
    setRecords(records.filter(record => record.id !== id));
  };

  const averageMood = records.length > 0
    ? records.reduce((sum, record) => sum + record.moodScore, 0) / records.length
    : 0;
  const averageEnergy = records.length > 0
    ? records.reduce((sum, record) => sum + record.energyLevel, 0) / records.length
    : 0;
  const averageStress = records.length > 0
    ? records.reduce((sum, record) => sum + record.stressLevel, 0) / records.length
    : 0;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Отслеживание самочувствия
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Добавить запись
            </Typography>
            <form onSubmit={handleSubmit}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography gutterBottom>Настроение</Typography>
                    <Slider
                      value={moodScore}
                      onChange={(event, newValue) => setMoodScore(newValue)}
                      min={1}
                      max={10}
                      marks
                      valueLabelDisplay="auto"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {moodScore}/10
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography gutterBottom>Уровень энергии</Typography>
                    <Slider
                      value={energyLevel}
                      onChange={(event, newValue) => setEnergyLevel(newValue)}
                      min={1}
                      max={10}
                      marks
                      valueLabelDisplay="auto"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {energyLevel}/10
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography gutterBottom>Уровень стресса</Typography>
                    <Slider
                      value={stressLevel}
                      onChange={(event, newValue) => setStressLevel(newValue)}
                      min={1}
                      max={10}
                      marks
                      valueLabelDisplay="auto"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {stressLevel}/10
                    </Typography>
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
                    <DateTimePicker
                      label="Время записи"
                      value={recordTime}
                      onChange={setRecordTime}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={!recordTime}
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
                Средние показатели
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Настроение
                  </Typography>
                  <Typography variant="h4">
                    {Math.round(averageMood)}/10
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Уровень энергии
                  </Typography>
                  <Typography variant="h4">
                    {Math.round(averageEnergy)}/10
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Уровень стресса
                  </Typography>
                  <Typography variant="h4">
                    {Math.round(averageStress)}/10
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Всего записей
                  </Typography>
                  <Typography variant="h4">{records.length}</Typography>
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
                  <TableCell align="right">Настроение</TableCell>
                  <TableCell align="right">Энергия</TableCell>
                  <TableCell align="right">Стресс</TableCell>
                  <TableCell>Заметки</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      {record.time?.toLocaleTimeString()}
                    </TableCell>
                    <TableCell align="right">{record.moodScore}/10</TableCell>
                    <TableCell align="right">{record.energyLevel}/10</TableCell>
                    <TableCell align="right">{record.stressLevel}/10</TableCell>
                    <TableCell>{record.notes}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(record.id)}
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

export default WellbeingTracker; 