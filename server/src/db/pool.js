const { Pool } = require('pg');
require('dotenv').config();

// Si no hay BD todavía, el pool simplemente no conecta
// y el servidor igual arranca sin errores
const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || 'impulso_db',
  user:     process.env.DB_USER     || 'postgres',
  password: process.env.DB_PASSWORD || 123,
});

// Verificar conexión al iniciar (no bloquea el servidor si falla)
pool.connect()
  .then(client => {
    console.log('PostgreSQL conectado correctamente');
    client.release();
  })
  .catch(err => {
    console.warn('PostgreSQL no disponible aún:', err.message);
    console.warn('El servidor sigue funcionando. Crea la BD cuando estés listo.');
  });

module.exports = pool;