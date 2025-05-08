module.exports = {
  db: {
    user: 'postgres',
    host: 'localhost',
    database: 'health_tracker_write',
    password: 'postgres',
    port: 5432,
  },
  readDb: {
    user: 'postgres',
    host: 'localhost',
    database: 'health_tracker_read',
    password: 'postgres',
    port: 5432,
  },
  jwtSecret: process.env.JWT_SECRET || 'health-tracker-secure-jwt-key-2023'
}; 