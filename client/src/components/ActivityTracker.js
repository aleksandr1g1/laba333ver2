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
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ACTIVITY_TYPES = [
  'Бег',
  'Ходьба',
  'Плавание',
  'Велосипед',
  'Тренажерный зал',
  'Йога',
  'Танцы',
  'Другое'
];

const ActivityTracker = () => {
  const [activities, setActivities] = useState([]);
  const { token } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [activityData, setActivityData] = useState({
    activityType: '',
    duration: '',
    intensity: '',
    date: new Date().toISOString().split('T')[0]
  });

  const fetchActivityRecords = useCallback(async () => {
    try {
      const response = await axios.get('/api/activity', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActivities(response.data);
    } catch (error) {
      console.error('Ошибка при получении записей об активности:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchActivityRecords();
  }, [token, fetchActivityRecords]);

  const handleOpenDialog = (record = null) => {
    if (record) {
      setEditingRecord(record);
      setActivityData({
        activityType: record.activity_type,
        duration: record.duration,
        intensity: record.intensity,
        date: record.date
      });
    } else {
      setEditingRecord(null);
      setActivityData({
        activityType: '',
        duration: '',
        intensity: '',
        date: new Date().toISOString().split('T')[0]
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
        await axios.put(`/api/activity/${editingRecord.id}`, activityData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/activity', activityData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchActivityRecords();
      handleCloseDialog();
    } catch (error) {
      console.error('Ошибка при сохранении активности:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/activity/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchActivityRecords();
    } catch (error) {
      console.error('Ошибка при удалении активности:', error);
    }
  };

  const handleChange = (e) => {
    setActivityData({ ...activityData, [e.target.name]: e.target.value });
  };

  const getIntensityLabel = (intensity) => {
    const labels = {
      1: 'Очень низкая',
      2: 'Низкая',
      3: 'Средняя',
      4: 'Высокая',
      5: 'Очень высокая'
    };
    return labels[intensity] || intensity;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Отслеживание активности
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
            {activities.map((record) => (
              <Paper key={record.id} sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6">
                    {record.activity_type}
                  </Typography>
                  <Typography>
                    Длительность: {record.duration} минут
                  </Typography>
                  <Typography>
                    Интенсивность: {getIntensityLabel(record.intensity)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(record.created_at).toLocaleString()}
                  </Typography>
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
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Тип активности</InputLabel>
              <Select
                name="activityType"
                value={activityData.activityType}
                onChange={handleChange}
                label="Тип активности"
              >
                {ACTIVITY_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Дата"
              name="date"
              type="date"
              value={activityData.date}
              onChange={handleChange}
              margin="normal"
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              fullWidth
              label="Длительность (минуты)"
              name="duration"
              type="number"
              value={activityData.duration}
              onChange={handleChange}
              margin="normal"
              required
              inputProps={{ min: 1 }}
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Интенсивность</InputLabel>
              <Select
                name="intensity"
                value={activityData.intensity}
                onChange={handleChange}
                label="Интенсивность"
              >
                {[1, 2, 3, 4, 5].map((level) => (
                  <MenuItem key={level} value={level}>
                    {getIntensityLabel(level)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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

export default ActivityTracker; 