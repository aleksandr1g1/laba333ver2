module.exports = {
  writeDb: {
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
  jwtSecret: 'your-secret-key-here',
  port: 3001
}; 