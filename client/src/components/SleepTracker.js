import React, { useState, useEffect, useCallback } from 'react';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Rating,
  Box
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SleepTracker = () => {
  const [sleepRecords, setSleepRecords] = useState([]);
  const { token } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [sleepData, setSleepData] = useState({
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date().toISOString().slice(0, 16),
    quality: 3
  });

  const fetchSleepRecords = useCallback(async () => {
    try {
      const response = await axios.get('/api/sleep', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSleepRecords(response.data);
    } catch (error) {
      console.error('Ошибка при получении записей о сне:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchSleepRecords();
  }, [token, fetchSleepRecords]);

  const handleOpenDialog = (record = null) => {
    if (record) {
      setEditingRecord(record);
      setSleepData({
        startTime: new Date(record.start_time).toISOString().slice(0, 16),
        endTime: new Date(record.end_time).toISOString().slice(0, 16),
        quality: record.quality
      });
    } else {
      setEditingRecord(null);
      setSleepData({
        startTime: new Date().toISOString().slice(0, 16),
        endTime: new Date().toISOString().slice(0, 16),
        quality: 3
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingRecord(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        await axios.put(`/api/sleep/${editingRecord.id}`, sleepData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/sleep', sleepData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchSleepRecords();
      handleCloseDialog();
    } catch (error) {
      console.error('Ошибка при сохранении данных о сне:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/sleep/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSleepRecords();
    } catch (error) {
      console.error('Ошибка при удалении записи о сне:', error);
    }
  };

  const handleChange = (e) => {
    setSleepData({ ...sleepData, [e.target.name]: e.target.value });
  };

  const calculateDuration = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const duration = (endDate - startDate) / (1000 * 60 * 60); // в часах
    return duration.toFixed(1);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Отслеживание сна
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Добавить запись
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              История записей
            </Typography>
            {sleepRecords.map((record) => (
              <Paper key={record.id} sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography>
                    Начало: {new Date(record.start_time).toLocaleString()}
                  </Typography>
                  <Typography>
                    Окончание: {new Date(record.end_time).toLocaleString()}
                  </Typography>
                  <Typography>
                    Продолжительность: {calculateDuration(record.start_time, record.end_time)} часов
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>Качество:</Typography>
                    <Rating value={record.quality} readOnly max={5} />
                  </Box>
                </Box>
                <Box>
                  <IconButton onClick={() => handleOpenDialog(record)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(record.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingRecord ? 'Редактировать запись' : 'Добавить запись'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              label="Время начала сна"
              type="datetime-local"
              name="startTime"
              value={sleepData.startTime}
              onChange={handleChange}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              fullWidth
              label="Время пробуждения"
              type="datetime-local"
              name="endTime"
              value={sleepData.endTime}
              onChange={handleChange}
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <Box sx={{ mt: 2 }}>
              <Typography component="legend">Качество сна</Typography>
              <Rating
                name="quality"
                value={sleepData.quality}
                onChange={(event, newValue) => {
                  setSleepData({ ...sleepData, quality: newValue });
                }}
                max={5}
                size="large"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Отмена</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingRecord ? 'Сохранить изменения' : 'Добавить'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default SleepTracker; 