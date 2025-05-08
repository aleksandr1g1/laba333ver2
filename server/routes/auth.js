const express = require('express');
const router = express.Router();
const { readPool, writePool } = require('../db/init');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/config');
const { authenticateToken } = require('../middleware/auth');

// Регистрация
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Проверка, существует ли уже пользователь с таким email
    const userExists = await readPool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }
    
    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Создание пользователя
    const result = await writePool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, hashedPassword]
    );
    
    // Создание JWT токена
    const token = jwt.sign(
      { id: result.rows[0].id },
      config.jwtSecret,
      { expiresIn: '30d' }
    );
    
    res.status(201).json({
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email
      },
      token
    });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Вход
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Поиск пользователя
    const result = await readPool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    
    const user = result.rows[0];
    
    // Проверка пароля
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordValid) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }
    
    // Создание JWT токена с увеличенным сроком действия
    const token = jwt.sign(
      { id: user.id },
      config.jwtSecret,
      { expiresIn: '30d' }
    );
    
    res.json({
      user: {
        id: user.id,
        email: user.email
      },
      token
    });
  } catch (error) {
    console.error('Ошибка при входе:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получение текущего пользователя
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email
    }
  });
});

// Обновление профиля
router.put('/profile', authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { email, currentPassword, newPassword } = req.body;
  
  try {
    // Проверяем, существует ли пользователь
    const user = await readPool.query('SELECT * FROM users WHERE id = $1', [userId]);
    
    if (user.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    let passwordHash = user.rows[0].password_hash;
    
    // Если передан пароль, проверяем текущий и обновляем
    if (newPassword) {
      const validPassword = await bcrypt.compare(currentPassword, user.rows[0].password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Неверный текущий пароль' });
      }
      
      passwordHash = await bcrypt.hash(newPassword, 10);
    }
    
    // Обновляем данные
    await writePool.query(
      'UPDATE users SET email = $1, password_hash = $2 WHERE id = $3',
      [email, passwordHash, userId]
    );
    
    res.json({ message: 'Профиль успешно обновлен' });
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router; 