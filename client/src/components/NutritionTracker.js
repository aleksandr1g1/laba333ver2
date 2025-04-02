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
  Divider,
  Chip,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const NutritionTracker = () => {
  const [records, setRecords] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [nutritionData, setNutritionData] = useState({
    date: new Date().toISOString().split('T')[0],
    dishes: [
      {
        id: Date.now(),
        name: '',
        proteins: '',
        fats: '',
        carbs: ''
      }
    ]
  });
  const { token } = useAuth();

  const fetchNutritionRecords = useCallback(async () => {
    try {
      const response = await axios.get('/api/nutrition', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecords(response.data);
    } catch (error) {
      console.error('Ошибка при получении записей о питании:', error);
    }
  }, [token]);

  useEffect(() => {
    fetchNutritionRecords();
  }, [token, fetchNutritionRecords]);

  const handleOpenDialog = (record = null) => {
    if (record) {
      setEditingRecord(record);
      
      // Разбираем данные о блюдах из строки JSON или используем одно блюдо, если формат старый
      let dishes = [];
      try {
        if (record.dishes_data) {
          dishes = JSON.parse(record.dishes_data);
        } else {
          // Совместимость со старыми записями
          dishes = [{
            id: Date.now(),
            name: record.dish_name || '',
            proteins: record.proteins || 0,
            fats: record.fats || 0,
            carbs: record.carbs || 0
          }];
        }
      } catch (e) {
        console.error('Ошибка при разборе данных о блюдах:', e);
        dishes = [{
          id: Date.now(),
          name: record.dish_name || '',
          proteins: record.proteins || 0,
          fats: record.fats || 0,
          carbs: record.carbs || 0
        }];
      }
      
      setNutritionData({
        date: record.date,
        dishes: dishes
      });
    } else {
      setEditingRecord(null);
      setNutritionData({
        date: new Date().toISOString().split('T')[0],
        dishes: [
          {
            id: Date.now(),
            name: '',
            proteins: '',
            fats: '',
            carbs: ''
          }
        ]
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
      // Вычисляем суммарные показатели
      const totalProteins = nutritionData.dishes.reduce((sum, dish) => sum + parseFloat(dish.proteins || 0), 0);
      const totalFats = nutritionData.dishes.reduce((sum, dish) => sum + parseFloat(dish.fats || 0), 0);
      const totalCarbs = nutritionData.dishes.reduce((sum, dish) => sum + parseFloat(dish.carbs || 0), 0);
      
      // Определяем название блюда как список блюд, разделенных запятой
      const dishNames = nutritionData.dishes.map(dish => dish.name).join(', ');
      
      // Данные для отправки на сервер
      const dataToSend = {
        date: nutritionData.date,
        dish_name: dishNames,
        proteins: totalProteins,
        fats: totalFats,
        carbs: totalCarbs,
        dishes_data: JSON.stringify(nutritionData.dishes) // Сохраняем все блюда для возможности редактирования
      };
      
      if (editingRecord) {
        await axios.put(`/api/nutrition/${editingRecord.id}`, dataToSend, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/nutrition', dataToSend, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      fetchNutritionRecords();
      handleCloseDialog();
    } catch (error) {
      console.error('Ошибка при сохранении данных о питании:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/nutrition/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNutritionRecords();
    } catch (error) {
      console.error('Ошибка при удалении записи о питании:', error);
    }
  };

  const handleAddDish = () => {
    setNutritionData({
      ...nutritionData,
      dishes: [
        ...nutritionData.dishes,
        {
          id: Date.now(),
          name: '',
          proteins: '',
          fats: '',
          carbs: ''
        }
      ]
    });
  };

  const handleRemoveDish = (dishId) => {
    if (nutritionData.dishes.length > 1) {
      setNutritionData({
        ...nutritionData,
        dishes: nutritionData.dishes.filter(dish => dish.id !== dishId)
      });
    }
  };

  const handleDishChange = (id, field, value) => {
    setNutritionData({
      ...nutritionData,
      dishes: nutritionData.dishes.map(dish => 
        dish.id === id ? { ...dish, [field]: value } : dish
      )
    });
  };

  const handleDateChange = (e) => {
    setNutritionData({ ...nutritionData, date: e.target.value });
  };

  const calculateTotalCalories = (proteins, fats, carbs) => {
    return (parseFloat(proteins || 0) * 4 + parseFloat(fats || 0) * 9 + parseFloat(carbs || 0) * 4).toFixed(1);
  };

  const getDishesDetails = (record) => {
    try {
      if (record.dishes_data) {
        const dishes = JSON.parse(record.dishes_data);
        return (
          <List dense disablePadding>
            {dishes.map((dish, index) => (
              <ListItem key={index} disablePadding sx={{ pl: 1 }}>
                <ListItemText 
                  primary={`${dish.name} (Б: ${dish.proteins}г, Ж: ${dish.fats}г, У: ${dish.carbs}г)`} 
                  sx={{ margin: 0 }}
                />
              </ListItem>
            ))}
          </List>
        );
      }
      // Для старых записей
      return <Typography>{record.dish_name}</Typography>;
    } catch (e) {
      return <Typography>{record.dish_name}</Typography>;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Отслеживание питания
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
            {records.map((record) => (
              <Paper key={record.id} sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip
                        icon={<RestaurantIcon />}
                        label={new Date(record.date).toLocaleDateString()}
                        color="primary"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      Запись о питании
                    </Typography>
                    <Box>
                      <IconButton onClick={() => handleOpenDialog(record)} color="primary" size="small">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(record.id)} color="error" size="small">
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ mb: 2 }}>
                    {getDishesDetails(record)}
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', mt: 1 }}>
                    <Typography variant="body2" sx={{ mr: 2 }}>
                      <strong>Итого белки:</strong> {record.proteins}г
                    </Typography>
                    <Typography variant="body2" sx={{ mr: 2 }}>
                      <strong>Итого жиры:</strong> {record.fats}г
                    </Typography>
                    <Typography variant="body2" sx={{ mr: 2 }}>
                      <strong>Итого углеводы:</strong> {record.carbs}г
                    </Typography>
                    <Typography variant="body2">
                      <strong>Итого калории:</strong> {calculateTotalCalories(record.proteins, record.fats, record.carbs)} ккал
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth scroll="paper">
        <DialogTitle>
          {editingRecord ? 'Редактировать запись' : 'Добавить запись'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers sx={{ maxHeight: '70vh', overflow: 'auto' }}>
            <TextField
              fullWidth
              label="Дата"
              name="date"
              type="date"
              value={nutritionData.date}
              onChange={handleDateChange}
              margin="normal"
              required
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ mb: 3 }}
            />
            
            <Typography variant="h6" gutterBottom>
              Блюда
            </Typography>
            
            {nutritionData.dishes.map((dish, index) => (
              <Card key={dish.id} variant="outlined" sx={{ mb: 2, p: 1 }}>
                <CardContent sx={{ pb: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Блюдо {index + 1}
                    </Typography>
                    {nutritionData.dishes.length > 1 && (
                      <IconButton 
                        size="small" 
                        color="error" 
                        onClick={() => handleRemoveDish(dish.id)}
                        aria-label="Удалить блюдо"
                      >
                        <RemoveIcon />
                      </IconButton>
                    )}
                  </Box>
                  <TextField
                    fullWidth
                    label="Название блюда"
                    value={dish.name}
                    onChange={(e) => handleDishChange(dish.id, 'name', e.target.value)}
                    margin="dense"
                    required
                  />
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Белки (г)"
                        type="number"
                        value={dish.proteins}
                        onChange={(e) => handleDishChange(dish.id, 'proteins', e.target.value)}
                        margin="dense"
                        required
                        inputProps={{ min: 0, step: 0.1 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Жиры (г)"
                        type="number"
                        value={dish.fats}
                        onChange={(e) => handleDishChange(dish.id, 'fats', e.target.value)}
                        margin="dense"
                        required
                        inputProps={{ min: 0, step: 0.1 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Углеводы (г)"
                        type="number"
                        value={dish.carbs}
                        onChange={(e) => handleDishChange(dish.id, 'carbs', e.target.value)}
                        margin="dense"
                        required
                        inputProps={{ min: 0, step: 0.1 }}
                      />
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Калории: {calculateTotalCalories(dish.proteins, dish.fats, dish.carbs)} ккал
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
            
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddDish}
              sx={{ mt: 1 }}
              fullWidth
            >
              Добавить ещё блюдо
            </Button>
            
            <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Итого за день:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={3}>
                  <Typography>
                    <strong>Белки:</strong> {nutritionData.dishes.reduce((sum, dish) => sum + parseFloat(dish.proteins || 0), 0).toFixed(1)}г
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography>
                    <strong>Жиры:</strong> {nutritionData.dishes.reduce((sum, dish) => sum + parseFloat(dish.fats || 0), 0).toFixed(1)}г
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography>
                    <strong>Углеводы:</strong> {nutritionData.dishes.reduce((sum, dish) => sum + parseFloat(dish.carbs || 0), 0).toFixed(1)}г
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Typography>
                    <strong>Калории:</strong> {calculateTotalCalories(
                      nutritionData.dishes.reduce((sum, dish) => sum + parseFloat(dish.proteins || 0), 0),
                      nutritionData.dishes.reduce((sum, dish) => sum + parseFloat(dish.fats || 0), 0),
                      nutritionData.dishes.reduce((sum, dish) => sum + parseFloat(dish.carbs || 0), 0)
                    )} ккал
                  </Typography>
                </Grid>
              </Grid>
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

export default NutritionTracker; 