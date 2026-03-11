const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const rawUpdates = [
    { name: 'Amarnath Regular Flight Package', date: '2026-06-28' },
    { name: 'Amarnath Regular Flight Package', date: '2026-07-02' },

    { name: 'Amarnath Special Flight Package', date: '2026-06-28' },
    { name: 'Amarnath Special Flight Package', date: '2026-07-05' },

    { name: 'Amarnath Special Flight Package (Helicopter)', date: '2026-07-05' },

    { name: 'Manasarovar Flight Package', date: '2026-05-31' },
    { name: 'Manasarovar Flight Package', date: '2026-06-30' },
    { name: 'Manasarovar Flight Package', date: '2026-07-30' },

    { name: 'Manasarovar With Muktinath Flight Package', date: '2026-05-31' },
    { name: 'Manasarovar With Muktinath Flight Package', date: '2026-06-30' },
    { name: 'Manasarovar With Muktinath Flight Package', date: '2026-07-30' },

    { name: 'Odisha Package', date: '2026-01-20' },
    { name: 'Odisha Package', date: '2026-02-20' },
    { name: 'Odisha Package', date: '2026-03-25' },
    { name: 'Odisha Package', date: '2026-04-25' },
    { name: 'Odisha Package', date: '2026-05-10' },
    { name: 'Odisha Package', date: '2026-06-20' },
    { name: 'Odisha Package', date: '2026-07-24' },
    { name: 'Odisha Package', date: '2026-08-23' },
    { name: 'Odisha Package', date: '2026-09-22' },
    { name: 'Odisha Package', date: '2026-10-23' },
    { name: 'Odisha Package', date: '2026-11-20' },
    { name: 'Odisha Package', date: '2026-12-16' },

    { name: 'Omkareshwar Ujjain Package', date: '2026-01-23' },
    { name: 'Omkareshwar Ujjain Package', date: '2026-02-23' },
    { name: 'Omkareshwar Ujjain Package', date: '2026-03-23' },
    { name: 'Omkareshwar Ujjain Package', date: '2026-04-23' },
    { name: 'Omkareshwar Ujjain Package', date: '2026-05-23' },
    { name: 'Omkareshwar Ujjain Package', date: '2026-06-23' },
    { name: 'Omkareshwar Ujjain Package', date: '2026-07-23' },
    { name: 'Omkareshwar Ujjain Package', date: '2026-08-23' },
    { name: 'Omkareshwar Ujjain Package', date: '2026-09-23' },
    { name: 'Omkareshwar Ujjain Package', date: '2026-10-23' },
    { name: 'Omkareshwar Ujjain Package', date: '2026-12-15' },

    { name: 'Rajasthan Package', date: '2026-02-25' },
    { name: 'Rajasthan Package', date: '2026-05-20' },
    { name: 'Rajasthan Package', date: '2026-06-20' },
    { name: 'Rajasthan Package', date: '2026-07-20' },
    { name: 'Rajasthan Package', date: '2026-08-19' },
    { name: 'Rajasthan Package', date: '2026-09-21' },
    { name: 'Rajasthan Package', date: '2026-10-13' },
    { name: 'Rajasthan Package', date: '2026-11-20' }
];

// Group dates by package
const groupedUpdates = {};
rawUpdates.forEach(u => {
    if (!groupedUpdates[u.name]) groupedUpdates[u.name] = new Set();
    groupedUpdates[u.name].add(u.date);
});

// Convert sets to arrays
for (const key in groupedUpdates) {
    groupedUpdates[key] = Array.from(groupedUpdates[key]);
}

function normalize(name) {
    return name.toLowerCase()
        .replace(/package|special|flight|bus|regular|tour|yatra|spl|\(helicopter\)/g, '')
        .replace(/[^a-z0-9]/g, '');
}

async function runDateUpdates() {
    try {
        const res = await pool.query("SELECT package_id, name FROM packages");
        const dbPackages = res.rows;
        let updatedCount = 0;

        for (const pkg of dbPackages) {
            const normDb = normalize(pkg.name);

            let bestMatchDates = null;
            let maxLen = 0;

            for (const [key, dates] of Object.entries(groupedUpdates)) {
                const normUp = normalize(key);
                if (normDb === normUp) {
                    bestMatchDates = dates;
                    break;
                }
                if (normDb.includes(normUp) || normUp.includes(normDb)) {
                    if (normUp.length > maxLen) {
                        maxLen = normUp.length;
                        bestMatchDates = dates;
                    }
                }
            }

            // Hardcoded explicit mappings
            if (pkg.name === 'AMARNATH YATRA SPECIAL') {
                // combine all dates for amarnath
                const allAmarnathDates = new Set([
                    ...(groupedUpdates['Amarnath Regular Flight Package'] || []),
                    ...(groupedUpdates['Amarnath Special Flight Package'] || []),
                    ...(groupedUpdates['Amarnath Special Flight Package (Helicopter)'] || []),
                ]);
                bestMatchDates = Array.from(allAmarnathDates).sort();
            }
            if (pkg.name === 'KAILASH - MANASAROVAR YATRA') {
                const allManasarovarDates = new Set([
                    ...(groupedUpdates['Manasarovar Flight Package'] || []),
                    ...(groupedUpdates['Manasarovar With Muktinath Flight Package'] || [])
                ]);
                bestMatchDates = Array.from(allManasarovarDates).sort();
            }
            if (pkg.name === 'RAJASTHAN SPECIAL PACKAGE') {
                bestMatchDates = groupedUpdates['Rajasthan Package'];
            }

            if (bestMatchDates && bestMatchDates.length > 0) {
                const datesStr = bestMatchDates.join(', ');
                await pool.query(
                    "UPDATE packages SET dates=$1 WHERE package_id=$2",
                    [datesStr, pkg.package_id]
                );
                console.log(`Updated '${pkg.name}' -> dates: ${datesStr}`);
                updatedCount++;
            }
        }
        console.log(`Successfully updated ${updatedCount} packages.`);
    } catch (err) {
        console.error('Error updating multiple dates:', err);
    } finally {
        await pool.end();
    }
}

runDateUpdates();
