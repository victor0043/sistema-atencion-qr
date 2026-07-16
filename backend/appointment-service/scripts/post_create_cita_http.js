const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const jwt = require('jsonwebtoken');
const fetch = global.fetch || require('node-fetch');

async function run() {
  try {
    const token = jwt.sign({ id: 9999, rol: 3, nombre: 'Prueba Admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const url = `http://localhost:${process.env.PORT || 3003}/api/appointments`;
    const body = {
      paciente_id: 2,
      medico_id: null,
      fecha: (new Date(Date.now() + 48*60*60*1000)).toISOString().split('T')[0],
      hora: '11:00'
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response body:', text);
    process.exit(0);
  } catch (err) {
    console.error('Error in post_create_cita_http:', err.message || err);
    process.exit(1);
  }
}

run();
