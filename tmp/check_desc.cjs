const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: '192.168.29.143',
    database: 'tripfluxdev',
    password: 'admin123',
    port: 5432
});

pool.query("SELECT package_id, name, description FROM packages").then(res => {
    const d = res.rows.filter(r => r.description && r.description.trim().length > 0);
    console.log("Packages with Description:", JSON.stringify(d, null, 2));
    process.exit(0);
}).catch(console.error);
