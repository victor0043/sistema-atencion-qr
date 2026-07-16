const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const fetch = global.fetch || require('node-fetch');
const jwt = require('jsonwebtoken');

async function run() {
  try {
    let token = process.argv[2];

    if (!token) {
      token = jwt.sign(
        {
          id: 1,
          rut: '140833991',
          nombre: 'Administrador',
          rol: 1
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      console.log('Using generated admin token');
    }

    const res = await fetch(`http://localhost:${process.env.PORT || 3005}/api/patients`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    const body = await res.text();
    console.log('status', res.status);
    console.log('body', body);
  } catch (error) {
    console.error(error);
  }
}
run();
