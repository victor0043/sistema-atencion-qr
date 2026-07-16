const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { conectarDB } = require('../src/config/database');
const appointmentService = require('../src/services/appointmentService');

async function run() {
  try {
    await conectarDB();
    const datos = {
      paciente_id: 2,
      medico_id: null,
      fecha: (new Date(Date.now() + 24*60*60*1000)).toISOString().split('T')[0],
      hora: '10:30'
    };

    const res = await appointmentService.crearCita(datos);
    console.log('Respuesta crearCita test:', res);
    process.exit(0);
  } catch (err) {
    console.error('Error en create_cita_test:', err.message || err);
    process.exit(1);
  }
}

run();
