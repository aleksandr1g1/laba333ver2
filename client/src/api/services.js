import apiClient from './client';

// Сервис для работы со сном
export const sleepService = {
  addSleepRecord: (data) => apiClient.post('/sleep', data),
  getSleepRecords: (userId) => apiClient.get(`/sleep/${userId}`),
  getSleepStats: (userId) => apiClient.get(`/sleep/stats/${userId}`),
  deleteSleepRecord: (id) => apiClient.delete(`/sleep/${id}`),
};

// Сервис для работы с питанием
export const nutritionService = {
  addMeal: (data) => apiClient.post('/nutrition', data),
  getMeals: (userId) => apiClient.get(`/nutrition/${userId}`),
  getNutritionStats: (userId) => apiClient.get(`/nutrition/stats/${userId}`),
  deleteMeal: (id) => apiClient.delete(`/nutrition/${id}`),
  getProducts: () => apiClient.get('/products'),
};

// Сервис для работы с активностью
export const activityService = {
  addActivity: (data) => apiClient.post('/activity', data),
  getActivities: (userId) => apiClient.get(`/activity/${userId}`),
  getActivityStats: (userId) => apiClient.get(`/activity/stats/${userId}`),
  deleteActivity: (id) => apiClient.delete(`/activity/${id}`),
};

// Сервис для работы с самочувствием
export const wellbeingService = {
  addWellbeingRecord: (data) => apiClient.post('/wellbeing', data),
  getWellbeingRecords: (userId) => apiClient.get(`/wellbeing/${userId}`),
  getWellbeingStats: (userId) => apiClient.get(`/wellbeing/stats/${userId}`),
  deleteWellbeingRecord: (id) => apiClient.delete(`/wellbeing/${id}`),
};

// Сервис для работы с пользователями
export const userService = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  getCurrentUser: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
}; 