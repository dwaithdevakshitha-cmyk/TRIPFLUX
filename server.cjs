const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

app.use(cors());
app.use(express.json());

// Proxy endpoint for SQL queries
app.post('/api/sql', async (req, res) => {
    const { query, params } = req.body;
    try {
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Bootstrap table
const bootstrap = async () => {
    try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS signature_tours (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            destination TEXT NOT NULL,
            dates TEXT NOT NULL,
            price TEXT NOT NULL,
            duration TEXT NOT NULL,
            category TEXT DEFAULT 'Domestic',
            price_basis TEXT DEFAULT 'Per Person',
            price_advance TEXT,
            highlights TEXT[],
            image TEXT,
            transport_type TEXT,
            contact_phone TEXT,
            contact_email TEXT,
            features TEXT[],
            terms TEXT[],
            media_files JSONB DEFAULT '[]',
            itinerary JSONB DEFAULT '[]'
          );

          CREATE TABLE IF NOT EXISTS login_details (
            id SERIAL PRIMARY KEY,
            role TEXT NOT NULL CHECK (role IN ('user', 'associate')),
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            first_name TEXT,
            last_name TEXT,
            date_of_birth DATE,
            pan_number TEXT UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        console.log('Database bootstrapped');
    } catch (err) {
        console.error('Bootstrap error:', err);
    }
};

app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
    bootstrap();
});
