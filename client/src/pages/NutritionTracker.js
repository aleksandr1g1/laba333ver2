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
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { ru } from 'date-fns/locale';

// Пример данных о продуктах
const products = [
  { id: 1, name: 'Овсяная каша', calories: 88, proteins: 3.2, fats: 1.8, carbs: 14.5 },
  { id: 2, name: 'Молоко', calories: 42, proteins: 3.4, fats: 1.0, carbs: 4.8 },
  { id: 3, name: 'Банан', calories: 89, proteins: 1.1, fats: 0.3, carbs: 22.8 },
];

function NutritionTracker() {
  const [selectedProduct, setSelectedProduct] = useState('');
  const [amount, setAmount] = useState('');
  const [mealTime, setMealTime] = useState(null);
  const [meals, setMeals] = useState([]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const product = products.find(p => p.name === selectedProduct);
    if (product) {
      const newMeal = {
        id: Date.now(),
        product: product.name,
        amount: parseFloat(amount),
        calories: Math.round(product.calories * parseFloat(amount) / 100),
        proteins: Math.round(product.proteins * parseFloat(amount) / 100),
        fats: Math.round(product.fats * parseFloat(amount) / 100),
        carbs: Math.round(product.carbs * parseFloat(amount) / 100),
        time: mealTime,
      };
      setMeals([...meals, newMeal]);
      setSelectedProduct('');
      setAmount('');
      setMealTime(null);
    }
  };

  const handleDelete = (id) => {
    setMeals(meals.filter(meal => meal.id !== id));
  };

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProteins = meals.reduce((sum, meal) => sum + meal.proteins, 0);
  const totalFats = meals.reduce((sum, meal) => sum + meal.fats, 0);
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Отслеживание питания
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Добавить прием пищи
            </Typography>
            <form onSubmit={handleSubmit}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label="Продукт"
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      SelectProps={{
                        native: true,
                      }}
                    >
                      <option value="">Выберите продукт</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.name}>
                          {product.name}
                        </option>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Количество (г)"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <DateTimePicker
                      label="Время приема пищи"
                      value={mealTime}
                      onChange={setMealTime}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      disabled={!selectedProduct || !amount || !mealTime}
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
                    Калории
                  </Typography>
                  <Typography variant="h4">{totalCalories}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Белки
                  </Typography>
                  <Typography variant="h4">{totalProteins}г</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Жиры
                  </Typography>
                  <Typography variant="h4">{totalFats}г</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Углеводы
                  </Typography>
                  <Typography variant="h4">{totalCarbs}г</Typography>
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
                  <TableCell>Продукт</TableCell>
                  <TableCell align="right">Количество (г)</TableCell>
                  <TableCell align="right">Калории</TableCell>
                  <TableCell align="right">Белки</TableCell>
                  <TableCell align="right">Жиры</TableCell>
                  <TableCell align="right">Углеводы</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {meals.map((meal) => (
                  <TableRow key={meal.id}>
                    <TableCell>
                      {meal.time?.toLocaleTimeString()}
                    </TableCell>
                    <TableCell>{meal.product}</TableCell>
                    <TableCell align="right">{meal.amount}</TableCell>
                    <TableCell align="right">{meal.calories}</TableCell>
                    <TableCell align="right">{meal.proteins}</TableCell>
                    <TableCell align="right">{meal.fats}</TableCell>
                    <TableCell align="right">{meal.carbs}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(meal.id)}
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

export default NutritionTracker; 