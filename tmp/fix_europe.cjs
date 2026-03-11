const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    ssl: {
        rejectUnauthorized: false
    },
});

async function run() {
    try {
        const res = await pool.query("SELECT package_id, name, dates FROM packages WHERE name = 'EUROPE SPL' ORDER BY package_id ASC");

        if (res.rows.length > 1) {
            // package_id 1 has null dates, package_id 2 has the actual dates
            const toKeep = res.rows.find(r => r.dates !== null) || res.rows[0];
            const toDelete = res.rows.find(r => r.package_id !== toKeep.package_id);

            console.log(`Keeping package_id: ${toKeep.package_id}, Deleting ${toDelete.package_id}`);

            // Update any bookings attached to the deleted package to point to the kept one
            await pool.query("UPDATE bookings SET package_id = $1 WHERE package_id = $2", [toKeep.package_id, toDelete.package_id]);
            console.log("Updated bookings.");

            // Delete child rows from package_itinerary
            await pool.query("DELETE FROM package_itinerary WHERE package_id = $1", [toDelete.package_id]);
            console.log("Deleted itinerary.");

            // Delete the duplicate package
            await pool.query("DELETE FROM packages WHERE package_id = $1", [toDelete.package_id]);
            console.log("Deleted package successfully.");
        }

        // Update any remaining packages where dates is null
        await pool.query("UPDATE packages SET dates = '2025 Flexible' WHERE dates IS NULL OR dates = '' OR dates = 'null'");
        console.log("Updated null dates to '2025 Flexible'.");

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
