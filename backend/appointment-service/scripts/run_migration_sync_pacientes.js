const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { sequelize, conectarDB } = require('../src/config/database');

async function run() {
  try {
    await conectarDB();
    const sql = `ALTER TABLE IF EXISTS pacientes
      ADD COLUMN IF NOT EXISTS direccion TEXT,
      ADD COLUMN IF NOT EXISTS telefono VARCHAR(20),
      ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE,
      ADD COLUMN IF NOT EXISTS prevision VARCHAR(100);`;
    await sequelize.query(sql);
    console.log('✅ Columnas sincronizadas en la tabla pacientes (appointment-service).');
    process.exit(0);
  } catch (err) {
    console.error('Error al aplicar migración:', err.message || err);
    process.exit(1);
  }
}

run();
