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

// Registration endpoint
app.post('/api/register', async (req, res) => {
  const { firstName, lastName, email, phone, password, role, panNumber, dateOfBirth } = req.body;
  try {
    // Generate custom IDs based on role
    const timestamp = Date.now().toString().slice(-6);
    const customUserId = role === 'user' ? `USR${timestamp}` : null;
    const associateId = role === 'associate' ? `ASC${timestamp}` : null;

    const query = `
      INSERT INTO login_details (first_name, last_name, email, phone, password, role, pan_number, date_of_birth, custom_user_id, associate_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING user_id, custom_user_id, associate_id, email, first_name, role
    `;
    const result = await pool.query(query, [firstName, lastName, email, phone, password, role, panNumber, dateOfBirth || null, customUserId, associateId]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Registration error:', err);
    if (err.code === '23505') {
      res.status(400).json({ error: 'Email already exists' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const query = 'SELECT * FROM login_details WHERE email = $1 AND password = $2';
    const result = await pool.query(query, [email, password]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      res.json({
        user_id: user.user_id,
        custom_user_id: user.custom_user_id,
        associate_id: user.associate_id,
        email: user.email,
        first_name: user.first_name,
        role: user.role
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
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
            user_id SERIAL PRIMARY KEY,
            custom_user_id VARCHAR(50),
            associate_id VARCHAR(50),
            first_name VARCHAR(100),
            last_name VARCHAR(100),
            email VARCHAR(150) UNIQUE NOT NULL,
            phone VARCHAR(20),
            password VARCHAR(255) NOT NULL,
            role VARCHAR(20) CHECK (role IN ('user','associate','admin')),
            pan_number VARCHAR(20),
            date_of_birth DATE,
            kyc_status VARCHAR(20),
            status VARCHAR(20) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS associate_hierarchy (
            associate_id INT PRIMARY KEY REFERENCES login_details(user_id),
            parent_associate_id INT REFERENCES login_details(user_id),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS commission_levels (
            level INT PRIMARY KEY,
            percentage NUMERIC(5,2)
          );

          -- Populate commission levels if empty
          INSERT INTO commission_levels (level, percentage) 
          VALUES (1, 10.00), (2, 5.00), (3, 3.00), (4, 2.00), (5, 1.50), (6, 1.00), (7, 0.50)
          ON CONFLICT (level) DO NOTHING;

          CREATE TABLE IF NOT EXISTS promo_codes (
            promo_id SERIAL PRIMARY KEY,
            code VARCHAR(50) UNIQUE NOT NULL,
            associate_id INT REFERENCES login_details(user_id),
            status VARCHAR(20) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS packages (
            package_id SERIAL PRIMARY KEY,
            name VARCHAR(200),
            destination VARCHAR(100),
            duration VARCHAR(50),
            price NUMERIC(10,2),
            description TEXT,
            status VARCHAR(20) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS bookings (
            booking_id SERIAL PRIMARY KEY,
            user_id INT REFERENCES login_details(user_id),
            associate_id INT REFERENCES login_details(user_id),
            package_id INT REFERENCES packages(package_id),
            travel_date DATE,
            total_amount NUMERIC(10,2),
            status VARCHAR(20) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
    console.log('Database bootstrapped with new schema');
  } catch (err) {
    console.error('Bootstrap error:', err);
  }
};

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
  bootstrap();
});
