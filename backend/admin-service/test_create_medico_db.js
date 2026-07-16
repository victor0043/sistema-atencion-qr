require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize } = require('./src/config/database');
const Usuario = require('./src/models/Usuario');
const Medico = require('./src/models/medicos');

async function run() {
    try {
        await sequelize.authenticate();
        console.log('DB connected');

        const payload = {
            rut: 'testmedico123',
            nombre: 'Test Medico',
            correo: `testmedico_${Date.now()}@example.com`,
            password: 'Medico123!',
            rol_id: 2,
            especialidad: 'cardiologia',
            box: '99'
        };

        const cleanRut = String(payload.rut).replace(/[.\-\s]/g, '');

        const existe = await Usuario.findOne({ where: { rut: cleanRut } });
        if (existe) {
            console.log('Usuario con rut ya existe:', existe.id);
            process.exit(0);
        }

        const hashed = await bcrypt.hash(payload.password, 10);

        const usuario = await Usuario.create({
            rut: cleanRut,
            nombre: payload.nombre,
            correo: payload.correo,
            password: hashed,
            rol_id: payload.rol_id,
            activo: true
        });

        const medico = await Medico.create({
            usuario_id: usuario.id,
            especialidad: payload.especialidad,
            box: payload.box
        });

        console.log('Created usuario id=', usuario.id, 'medico id=', medico.id);
        process.exit(0);
    } catch (err) {
        console.error('Error creating medico:', err);
        process.exit(1);
    }
}

run();
