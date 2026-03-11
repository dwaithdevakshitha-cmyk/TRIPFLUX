const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const updates = [
    "UPDATE packages SET dates='2026-01-20', travel_type='flight' WHERE name='Naimisharanyam – Kashi Special Package'",
    "UPDATE packages SET dates='2026-01-20', travel_type='flight' WHERE name='Kashi – Prayagraj – Gaya Package'",
    "UPDATE packages SET dates='2026-01-19', travel_type='flight' WHERE name='Naimisharanyam – Ayodhya - Kashi – Gaya package'",
    "UPDATE packages SET dates='2026-01-20', travel_type='flight' WHERE name='Naimisharanyam - Ayodhya-Kashi Package'",
    "UPDATE packages SET dates='2026-01-25', travel_type='flight' WHERE name='Gujarat – Madhya Pradesh Flight Package'",
    "UPDATE packages SET dates='2026-01-25', travel_type='flight' WHERE name='Gujarat Package'",
    "UPDATE packages SET dates='2026-01-25', travel_type='flight' WHERE name='Tamilnadu Special Flight Package'",
    "UPDATE packages SET dates='2026-03-25', travel_type='bus' WHERE name='Maharastra Special Bus Package'",
    "UPDATE packages SET dates='2026-03-25', travel_type='flight' WHERE name='Maharastra Jyothirlinga Special Package'",
    "UPDATE packages SET dates='2026-01-19', travel_type='flight' WHERE name='Karnataka Flight Package'",
    "UPDATE packages SET dates='2026-03-25', travel_type='flight' WHERE name='Muktinath Flight Package'",
    "UPDATE packages SET dates='2026-04-20', travel_type='flight' WHERE name='Chardham Flight Package'",
    "UPDATE packages SET dates='2026-04-25', travel_type='flight' WHERE name='Do Dham Package'",
    "UPDATE packages SET dates='2026-06-28', travel_type='flight' WHERE name='Amarnath Regular Flight Package'",
    "UPDATE packages SET dates='2026-07-05', travel_type='flight' WHERE name='Amarnath Special Flight Package'",
    "UPDATE packages SET dates='2026-05-31', travel_type='flight' WHERE name='Manasarovar Flight Package'",
    "UPDATE packages SET dates='2026-01-20', travel_type='flight' WHERE name='Odisha Package'",
    "UPDATE packages SET dates='2026-01-23', travel_type='flight' WHERE name='Omkareshwar – Ujjain Package'",
    "UPDATE packages SET dates='2026-02-25', travel_type='flight' WHERE name='Rajasthan Package'",
    "UPDATE packages SET dates='2026-04-25', travel_type='flight' WHERE name='Srinagar – Kashmir Flight Package'",
    "UPDATE packages SET dates='2026-04-25', travel_type='flight' WHERE name='Kashmir Package'",
    "UPDATE packages SET dates='2026-04-25', travel_type='flight' WHERE name='Gangtok-Darjeeling'",
    "UPDATE packages SET dates='2026-04-25', travel_type='flight' WHERE name='Guwahati Package'",
    "UPDATE packages SET dates='2026-04-25', travel_type='flight' WHERE name='Shimla - Manali Package'",
    "UPDATE packages SET dates='2026-03-27', travel_type='flight' WHERE name='Tamilnadu Special Package'",
    "UPDATE packages SET dates='2026-01-28', travel_type='flight' WHERE name='Andaman Package'",
    "UPDATE packages SET dates='2026-01-10', travel_type='flight' WHERE name='Goa Package'",
    "UPDATE packages SET dates='2026-04-25', travel_type='flight' WHERE name='Kolkata - Ganga Sagar Package'"
];

async function runUpdates() {
    try {
        for (const sql of updates) {
            const res = await pool.query(sql);
            console.log(`Executed: ${sql} - Rows affected: ${res.rowCount}`);
        }
        console.log('All updates completed successfully.');
    } catch (err) {
        console.error('Error executing updates:', err);
    } finally {
        await pool.end();
    }
}

runUpdates();
