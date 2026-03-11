const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const userUpdates = [
    { rawName: 'Naimisharanyam – Kashi Special Package', dates: '2026-01-20', travel_type: 'flight' },
    { rawName: 'Kashi – Prayagraj – Gaya Package', dates: '2026-01-20', travel_type: 'flight' },
    { rawName: 'Naimisharanyam – Ayodhya - Kashi – Gaya package', dates: '2026-01-19', travel_type: 'flight' },
    { rawName: 'Naimisharanyam - Ayodhya-Kashi Package', dates: '2026-01-20', travel_type: 'flight' },
    { rawName: 'Gujarat – Madhya Pradesh Flight Package', dates: '2026-01-25', travel_type: 'flight' },
    { rawName: 'Gujarat Package', dates: '2026-01-25', travel_type: 'flight' },
    { rawName: 'Tamilnadu Special Flight Package', dates: '2026-01-25', travel_type: 'flight' },
    { rawName: 'Maharastra Special Bus Package', dates: '2026-03-25', travel_type: 'bus' },
    { rawName: 'Maharastra Jyothirlinga Special Package', dates: '2026-03-25', travel_type: 'flight' },
    { rawName: 'Karnataka Flight Package', dates: '2026-01-19', travel_type: 'flight' },
    { rawName: 'Muktinath Flight Package', dates: '2026-03-25', travel_type: 'flight' },
    { rawName: 'Chardham Flight Package', dates: '2026-04-20', travel_type: 'flight' },
    { rawName: 'Do Dham Package', dates: '2026-04-25', travel_type: 'flight' },
    { rawName: 'Amarnath Regular Flight Package', dates: '2026-06-28', travel_type: 'flight' },
    { rawName: 'Amarnath Special Flight Package', dates: '2026-07-05', travel_type: 'flight' },
    { rawName: 'Manasarovar Flight Package', dates: '2026-05-31', travel_type: 'flight' },
    { rawName: 'Odisha Package', dates: '2026-01-20', travel_type: 'flight' },
    { rawName: 'Omkareshwar – Ujjain Package', dates: '2026-01-23', travel_type: 'flight' },
    { rawName: 'Rajasthan Package', dates: '2026-02-25', travel_type: 'flight' },
    { rawName: 'Srinagar – Kashmir Flight Package', dates: '2026-04-25', travel_type: 'flight' },
    { rawName: 'Kashmir Package', dates: '2026-04-25', travel_type: 'flight' },
    { rawName: 'Gangtok-Darjeeling', dates: '2026-04-25', travel_type: 'flight' },
    { rawName: 'Guwahati Package', dates: '2026-04-25', travel_type: 'flight' },
    { rawName: 'Shimla - Manali Package', dates: '2026-04-25', travel_type: 'flight' },
    { rawName: 'Tamilnadu Special Package', dates: '2026-03-27', travel_type: 'flight' },
    { rawName: 'Andaman Package', dates: '2026-01-28', travel_type: 'flight' },
    { rawName: 'Goa Package', dates: '2026-01-10', travel_type: 'flight' },
    { rawName: 'Kolkata - Ganga Sagar Package', dates: '2026-04-25', travel_type: 'flight' }
];

function normalize(name) {
    // Remove common words, punctuation, spaces, to lowercase
    return name.toLowerCase()
        .replace(/package|special|flight|bus|regular|tour|yatra|spl/g, '')
        .replace(/[^a-z0-9]/g, '');
}

async function smartUpdate() {
    try {
        const res = await pool.query("SELECT package_id, name FROM packages");
        const dbPackages = res.rows;

        let updatedCount = 0;

        for (const pkg of dbPackages) {
            const normDb = normalize(pkg.name);

            // Find matching user update
            let bestMatch = null;
            let maxLen = 0;

            for (const update of userUpdates) {
                const normUp = normalize(update.rawName);
                if (normDb.includes(normUp) || normUp.includes(normDb)) {
                    if (normUp.length > maxLen) {
                        maxLen = normUp.length;
                        bestMatch = update;
                    }
                }
            }

            // Hardcoded explicit mappings for tricky ones
            if (pkg.name === 'NAIMISARANYAM KASHI-GAYA SPECIAL' || pkg.name === 'KASHI SPECIAL PACKAGE') {
                bestMatch = { dates: '2026-01-20', travel_type: 'flight' };
            }
            if (pkg.name === 'TAMIL NADU SPECIAL PACKAGE') {
                bestMatch = { dates: '2026-03-27', travel_type: 'flight' }; // Or 01-25?
                // Tamilnadu Special Package -> 2026-03-27
            }
            if (pkg.name === 'MAHARASHTRA SPECIAL PACKAGE') {
                bestMatch = { dates: '2026-03-25', travel_type: 'bus' };
            }
            if (pkg.name === 'DODHAM SPECIAL PACKAGE') {
                bestMatch = { dates: '2026-04-25', travel_type: 'flight' };
            }
            if (pkg.name === 'KAILASH - MANASAROVAR YATRA') {
                bestMatch = { dates: '2026-05-31', travel_type: 'flight' };
            }

            if (bestMatch) {
                await pool.query(
                    "UPDATE packages SET dates=$1, travel_type=$2 WHERE package_id=$3",
                    [bestMatch.dates, bestMatch.travel_type, pkg.package_id]
                );
                console.log(`Updated '${pkg.name}' -> dates: ${bestMatch.dates}, travel_type: ${bestMatch.travel_type}`);
                updatedCount++;
            }
        }
        console.log(`Successfully updated ${updatedCount} packages using loose matching.`);
    } catch (err) {
        console.error('Error applying smart updates:', err);
    } finally {
        await pool.end();
    }
}

smartUpdate();
