import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Button,
  Paper,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  TextField,
  IconButton,
  Grid
} from '@mui/material';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const WellbeingTracker = () => {
  const [wellbeingRecords, setWellbeingRecords] = useState([]);
  const { token } = useAuth();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [wellbeingData, setWellbeingData] = useState({
    mood: 5,
    energyLevel: 5,
    stressLevel: 5,
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });

  const fetchWellbeingRecords = useCallback(async () => {
    try {
      const response = await axios.get('/api/wellbeing', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWellbeingRecords(response.data);
    } catch (error) {
      console.error('Ошибка при получении записей о самочувствии:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchWellbeingRecords();
  }, [fetchWellbeingRecords]);

  const handleOpenDialog = (record = null) => {
    if (record) {
      setEditingRecord(record);
      setWellbeingData({
        mood: record.mood,
        energyLevel: record.energy_level,
        stressLevel: record.stress_level,
        notes: record.notes || '',
        date: record.date
      });
    } else {
      setEditingRecord(null);
      setWellbeingData({
        mood: 5,
        energyLevel: 5,
        stressLevel: 5,
        notes: '',
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
        await axios.put(`/api/wellbeing/${editingRecord.id}`, wellbeingData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/wellbeing', wellbeingData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchWellbeingRecords();
      handleCloseDialog();
    } catch (error) {
      console.error('Ошибка при сохранении данных о самочувствии:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/wellbeing/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchWellbeingRecords();
    } catch (error) {
      console.error('Ошибка при удалении записи о самочувствии:', error);
    }
  };

  const handleChange = (e) => {
    setWellbeingData({ ...wellbeingData, [e.target.name]: e.target.value });
  };

  const getMoodIcon = (mood) => {
    const icons = {
      1: <SentimentVeryDissatisfiedIcon color="error" />,
      2: <SentimentDissatisfiedIcon color="warning" />,
      3: <SentimentNeutralIcon color="action" />,
      4: <SentimentSatisfiedIcon color="success" />,
      5: <SentimentVerySatisfiedIcon color="success" />
    };
    return icons[mood] || null;
  };

  const getMoodLabel = (mood) => {
    const labels = {
      1: 'Очень плохое',
      2: 'Плохое',
      3: 'Нормальное',
      4: 'Хорошее',
      5: 'Отличное'
    };
    return labels[mood] || mood;
  };

  const getLevelLabel = (level) => {
    const labels = {
      1: 'Очень низкий',
      2: 'Низкий',
      3: 'Средний',
      4: 'Высокий',
      5: 'Очень высокий'
    };
    return labels[level] || level;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Отслеживание самочувствия
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
            {wellbeingRecords.map((record) => (
              <Paper key={record.id} sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {getMoodIcon(record.mood)}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      Настроение: {getMoodLabel(record.mood)}
                    </Typography>
                  </Box>
                  <Typography>
                    Уровень энергии: {getLevelLabel(record.energy_level)}
                  </Typography>
                  <Typography>
                    Уровень стресса: {getLevelLabel(record.stress_level)}
                  </Typography>
                  {record.notes && (
                    <Typography sx={{ mt: 1 }}>
                      Заметки: {record.notes}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    Дата: {new Date(record.date).toLocaleDateString()}
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
            <TextField
              fullWidth
              label="Дата"
              name="date"
              type="date"
              value={wellbeingData.date}
              onChange={handleChange}
              margin="normal"
              required
              InputLabelProps={{
                shrink: true,
              }}
            />
            <Box sx={{ mt: 2 }}>
              <Typography component="legend">Настроение</Typography>
              <Rating
                name="mood"
                value={wellbeingData.mood}
                onChange={(event, newValue) => {
                  setWellbeingData({ ...wellbeingData, mood: newValue });
                }}
                max={5}
                size="large"
              />
              <Typography variant="caption" color="text.secondary">
                {getMoodLabel(wellbeingData.mood)}
              </Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography component="legend">Уровень энергии</Typography>
              <Rating
                name="energyLevel"
                value={wellbeingData.energyLevel}
                onChange={(event, newValue) => {
                  setWellbeingData({ ...wellbeingData, energyLevel: newValue });
                }}
                max={5}
                size="large"
              />
              <Typography variant="caption" color="text.secondary">
                {getLevelLabel(wellbeingData.energyLevel)}
              </Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography component="legend">Уровень стресса</Typography>
              <Rating
                name="stressLevel"
                value={wellbeingData.stressLevel}
                onChange={(event, newValue) => {
                  setWellbeingData({ ...wellbeingData, stressLevel: newValue });
                }}
                max={5}
                size="large"
              />
              <Typography variant="caption" color="text.secondary">
                {getLevelLabel(wellbeingData.stressLevel)}
              </Typography>
            </Box>
            <TextField
              fullWidth
              label="Заметки"
              name="notes"
              value={wellbeingData.notes}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={4}
            />
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

export default WellbeingTracker; 