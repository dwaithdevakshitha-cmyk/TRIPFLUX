const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync('/certs/global-bundle.pem').toString(),
    },
});

pool.query('SELECT name, image FROM packages WHERE image LIKE \'%unsplash%\'').then(res => {
    console.log(JSON.stringify(res.rows, null, 2));
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
