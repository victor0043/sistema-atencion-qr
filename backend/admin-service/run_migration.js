require('dotenv').config();
const fs = require('fs');
const path = require('path');

const { sequelize } = require('./src/config/database');

async function run() {
    const sqlPath = path.join(__dirname, 'migrations', '20260713_dedup_and_add_unique_constraints.sql');
    if (!fs.existsSync(sqlPath)) {
        console.error('Migration file not found:', sqlPath);
        process.exit(1);
    }

    const sql = fs.readFileSync(sqlPath, 'utf8');

    try {
        await sequelize.authenticate();
        console.log('Connected to DB via Sequelize');

        // Execute the SQL script
        await sequelize.query(sql);

        console.log('Migration executed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

run();
