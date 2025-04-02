const jwt = require('jsonwebtoken');
const { readPool } = require('../db/init');
const config = require('../config/config');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Требуется авторизация' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const result = await readPool.query(
      'SELECT id, email FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('Ошибка проверки токена:', error);
    return res.status(403).json({ error: 'Недействительный токен' });
  }
};

module.exports = {
  authenticateToken
}; 