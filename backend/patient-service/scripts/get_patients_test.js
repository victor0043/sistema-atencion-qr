const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const jwt = require('jsonwebtoken');
const fetch = global.fetch || require('node-fetch');

async function run() {
  try {
    const token = jwt.sign({ id: 9999, rol: 3, nombre: 'Prueba Admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const url = `http://localhost:${process.env.PORT || 3005}/api/patients`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Response body:', text);
    process.exit(0);
  } catch (err) {
    console.error('Error in get_patients_test:', err.message || err);
    process.exit(1);
  }
}

run();
