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
app.use(express.json({ limit: '50mb' }));

// Ping endpoint for health checks
app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date(), message: 'TripFlux Backend is alive' });
});

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

// Packages endpoint
app.get('/api/packages', async (req, res) => {
  try {
    const query = `
      SELECT 
        package_id as id, 
        name as title, 
        category, 
        destination, 
        duration, 
        price, 
        description, 
        dates, 
        price_basis, 
        price_advance, 
        highlights, 
        image, 
        transport_type, 
        contact_phone, 
        contact_email, 
        features, 
        terms, 
        media_files, 
        itinerary, 
        custom_id
      FROM packages 
      WHERE status = 'active'
      ORDER BY package_id DESC
    `;
    const result = await pool.query(query);
    
    // Format JSON fields and price back to strings if necessary
    const formatted = result.rows.map(row => ({
      ...row,
      id: row.custom_id || row.id.toString(),
      price: `₹${parseFloat(row.price).toLocaleString('en-IN')}`,
      highlights: row.highlights || [],
      features: row.features || [],
      terms: row.terms || [],
      media_files: row.media_files || [],
      itinerary: row.itinerary || []
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching packages:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Registration endpoint
app.post('/api/register', async (req, res) => {
  const { firstName, lastName, email, phone, password, role, panNumber, dateOfBirth, referralCode } = req.body;

  // Backend Validation: Phone Number
  if (role === 'associate' || (role === 'user' && phone && phone.trim() !== '')) {
    if (!phone || !/^\d{10}$/.test(phone.toString())) {
      return res.status(400).json({ error: 'Phone number must be exactly 10 digits.' });
    }
  } else if (role === 'user' && (!phone || phone.trim() === '')) {
     // For user with no phone, verify they have an email
     if (!email || email.trim() === '' || email.includes('@placeholder.com')) {
        return res.status(400).json({ error: 'Either a valid email or phone number is required.' });
     }
  }

  // Backend Validation: Age 18+
  if (role === 'associate') {
    if (!dateOfBirth) {
      return res.status(400).json({ error: 'Date of birth is required for associates.' });
    }
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    if (age < 18) {
      return res.status(400).json({ error: 'You must be at least 18 years old to register.' });
    }
  }

  try {
    // Generate custom IDs based on role
    const timestamp = Date.now().toString().slice(-6);
    const customUserId = role === 'user' ? `USR${timestamp}` : null;
    const associateId = role === 'associate' ? `ASC${timestamp}` : null;

    await pool.query('BEGIN');

    const query = `
      INSERT INTO login_details (first_name, last_name, email, phone, password, role, pan_number, date_of_birth, custom_user_id, associate_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING user_id, custom_user_id, associate_id, email, first_name, role, avatar
    `;
    const result = await pool.query(query, [firstName, lastName, email, phone, password, role, panNumber, dateOfBirth || null, customUserId, associateId]);
    const newUser = result.rows[0];

    // Handle Referral logic
    if (referralCode) {
      // Find the referrer by associate_id, custom_user_id, or promo_code
      const referrerQuery = `
        SELECT u.user_id 
        FROM login_details u
        LEFT JOIN promo_codes p ON u.user_id = p.associate_id
        WHERE u.user_id::text = $1 OR u.custom_user_id = $1 OR u.associate_id = $1 OR p.code = $1
        LIMIT 1
      `;
      const referrerResult = await pool.query(referrerQuery, [referralCode]);

      if (referrerResult.rows.length > 0) {
        const referrerId = referrerResult.rows[0].user_id;
        const referrerIdStr = `refr${referrerId}`;

        // Insert into referrals table
        const refResult = await pool.query(`
          INSERT INTO referrals (referral_id, referrer_id, referred_user_id, referral_type, promo_code)
          VALUES ('temp', $1, $2, $3, $4)
          RETURNING id
        `, [referrerIdStr, newUser.user_id, role, referralCode]);

        const seqId = refResult.rows[0].id;
        const referralIdStr = `refl${seqId}`;

        // Update the referral_id to include the prefix
        await pool.query(`
          UPDATE referrals 
          SET referral_id = $1 
          WHERE id = $2
        `, [referralIdStr, seqId]);
      }
    }

    // Auto-generate promo code for New Associates
    if (role === 'associate') {
      const generatedCode = `${firstName.toUpperCase().replace(/\s/g, '')}${Date.now().toString().slice(-4)}`;
      await pool.query(
        "INSERT INTO promo_codes (code, associate_id, status) VALUES ($1, $2, 'active')",
        [generatedCode, newUser.user_id]
      );
      newUser.promo_code = generatedCode;
    }

    await pool.query('COMMIT');
    res.status(201).json(newUser);
  } catch (err) {
    await pool.query('ROLLBACK');
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
    const query = `
      SELECT l.*, p.code as promo_code 
      FROM login_details l 
      LEFT JOIN promo_codes p ON l.user_id = p.associate_id AND p.status = 'active'
      WHERE l.email = $1 AND l.password = $2
    `;
    const result = await pool.query(query, [email, password]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      res.json({
        user_id: user.user_id,
        custom_user_id: user.custom_user_id,
        associate_id: user.associate_id,
        email: user.email,
        first_name: user.first_name,
        role: user.role,
        avatar: user.avatar,
        promo_code: user.promo_code
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Referrals endpoint for Dashboard
app.get('/api/referrals/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const query = `
      SELECT r.referral_id, r.referral_type, r.promo_code, r.status, r.created_at,
             l.first_name, l.last_name, l.email, l.custom_user_id, l.associate_id
      FROM referrals r
      JOIN login_details l ON r.referred_user_id = l.user_id
      WHERE r.referrer_id = $1
      ORDER BY r.created_at DESC
    `;
    const formattedUserId = `refr${userId}`;
    const result = await pool.query(query, [formattedUserId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching referrals:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
app.get('/api/users/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const query = `
      SELECT l.first_name, l.last_name, l.email, l.phone, l.password, l.avatar, p.code as promo_code 
      FROM login_details l 
      LEFT JOIN promo_codes p ON l.user_id = p.associate_id AND p.status = 'active'
      WHERE l.user_id::text = $1 OR l.custom_user_id = $1 OR l.associate_id = $1
    `;
    const result = await pool.query(query, [userId]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user by email (used to resolve real user_id before booking)
app.get('/api/users/by-email/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const result = await pool.query(`
      SELECT l.user_id, l.custom_user_id, l.associate_id, l.first_name, l.last_name, l.email, l.role, l.avatar, p.code as promo_code 
      FROM login_details l 
      LEFT JOIN promo_codes p ON l.user_id = p.associate_id AND p.status = 'active'
      WHERE l.email = $1 LIMIT 1
    `, [decodeURIComponent(email)]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error('Error fetching user by email:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
app.put('/api/users/:userId', async (req, res) => {
  const { userId } = req.params;
  const { first_name, last_name, phone, password, avatar } = req.body;

  try {
    const query = `
      UPDATE login_details
      SET first_name = $1, last_name = $2, phone = $3, password = $4, avatar = COALESCE($5, avatar)
      WHERE user_id::text = $6 OR custom_user_id = $6 OR associate_id = $6
      RETURNING first_name, last_name, email, phone, avatar
    `;
    const result = await pool.query(query, [first_name, last_name, phone, password, avatar, userId]);
    if (result.rows.length > 0) {
      res.json({ message: 'Profile updated successfully', user: result.rows[0] });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user avatar
app.patch('/api/users/:userId/avatar', async (req, res) => {
  const { userId } = req.params;
  const { avatar } = req.body;

  try {
    const query = `
      UPDATE login_details
      SET avatar = $1
      WHERE user_id::text = $2 OR custom_user_id = $2 OR associate_id = $2
      RETURNING avatar
    `;
    const result = await pool.query(query, [avatar, userId]);
    if (result.rows.length > 0) {
      res.json({ message: 'Avatar updated successfully', avatar: result.rows[0].avatar });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    console.error('Error updating avatar:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user bookings
app.get('/api/bookings/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const query = `
      SELECT b.booking_id, b.travel_date, b.total_amount, b.status, b.created_at,
             p.name as package_name, p.destination
      FROM bookings b
      LEFT JOIN packages p ON b.package_id = p.package_id
      WHERE b.user_id = $1
      ORDER BY b.created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new booking
app.post('/api/bookings', async (req, res) => {
  const { userId, userEmail, packageId, travelDate, totalAmount, promoCode, associateId: providedAssociateId } = req.body;

  if (!userId || !packageId || !totalAmount) {
    return res.status(400).json({ error: 'Missing required booking information' });
  }

  try {
    await pool.query('BEGIN');

    // 0. Resolve userId to a valid DB integer
    let numericUserId = parseInt(userId);
    if (isNaN(numericUserId) || numericUserId > 2147483647) {
      // userId is a string custom_user_id (e.g. 'USR123456') or a huge timestamp fallback
      // Step 1: Try to find by custom_user_id or associate_id
      const userLookup = await pool.query(
        'SELECT user_id FROM login_details WHERE custom_user_id = $1 OR associate_id = $1 LIMIT 1',
        [userId.toString()]
      );
      if (userLookup.rows.length > 0) {
        numericUserId = userLookup.rows[0].user_id;
      } else if (userEmail) {
        // Step 2: Fallback – look up by email (catches users with timestamp-based localStorage IDs)
        const emailLookup = await pool.query(
          'SELECT user_id FROM login_details WHERE email = $1 LIMIT 1',
          [userEmail]
        );
        if (emailLookup.rows.length > 0) {
          numericUserId = emailLookup.rows[0].user_id;
        } else {
          numericUserId = null; // user genuinely not in DB (offline-only signup)
        }
      } else {
        numericUserId = null;
      }
    } else {
      // Validate the numeric userId actually exists in login_details
      const userCheck = await pool.query('SELECT user_id FROM login_details WHERE user_id = $1', [numericUserId]);
      if (userCheck.rows.length === 0) {
        // Try email lookup as fallback
        if (userEmail) {
          const emailLookup = await pool.query('SELECT user_id FROM login_details WHERE email = $1 LIMIT 1', [userEmail]);
          numericUserId = emailLookup.rows.length > 0 ? emailLookup.rows[0].user_id : null;
        } else {
          numericUserId = null;
        }
      }
    }

    // 1. Resolve package_id if it's a custom_id
    let numericPackageId = parseInt(packageId);
    if (isNaN(numericPackageId)) {
      try {
        const pkgResult = await pool.query('SELECT package_id FROM packages WHERE custom_id = $1', [packageId]);
        if (pkgResult.rows.length > 0) {
          numericPackageId = pkgResult.rows[0].package_id;
        } else {
          const sigResult = await pool.query('SELECT package_id FROM packages WHERE name = (SELECT title FROM signature_tours WHERE id = $1)', [packageId]);
          if (sigResult.rows.length > 0) {
            numericPackageId = sigResult.rows[0].package_id;
          } else {
            await pool.query('ROLLBACK');
            return res.status(404).json({ error: `Package '${packageId}' not found.` });
          }
        }
      } catch (innerErr) {
        console.warn('Package ID lookup failed:', innerErr.message);
        await pool.query('ROLLBACK');
        return res.status(404).json({ error: 'Package resolution failed. Invalid package identifier.' });
      }
    } else {
      // Validate numeric packageId exists
      const pkgCheck = await pool.query('SELECT package_id FROM packages WHERE package_id = $1', [numericPackageId]);
      if (pkgCheck.rows.length === 0) {
        // Try treating it as a custom_id string
        const pkgResult = await pool.query('SELECT package_id FROM packages WHERE custom_id = $1', [packageId.toString()]);
        if (pkgResult.rows.length > 0) {
          numericPackageId = pkgResult.rows[0].package_id;
        } else {
          await pool.query('ROLLBACK');
          return res.status(404).json({ error: `Package with ID '${packageId}' not found.` });
        }
      }
    }

    // 2. Determine associate_id
    let finalAssociateId = providedAssociateId || null;

    // If promo code provided, look up associate
    if (promoCode && !finalAssociateId) {
      const promoResult = await pool.query("SELECT associate_id FROM promo_codes WHERE code = $1 AND status = 'active'", [promoCode]);
      if (promoResult.rows.length > 0) {
        finalAssociateId = promoResult.rows[0].associate_id;
      }
    }

    // If still no associate and user is in the DB, check if user was referred
    if (!finalAssociateId && numericUserId) {
      try {
        const refResult = await pool.query(`
          SELECT referrer_id 
          FROM referrals 
          WHERE referred_user_id = $1 AND status = 'active'
          LIMIT 1
        `, [numericUserId]);

        if (refResult.rows.length > 0) {
          const refIdStr = refResult.rows[0].referrer_id;
          if (refIdStr && refIdStr.startsWith('refr')) {
            finalAssociateId = parseInt(refIdStr.replace('refr', ''));
          }
        }
      } catch (refErr) {
        console.warn('Referral lookup failed (non-critical):', refErr.message);
      }
    }

    // 3. Parse amount
    const cleanAmount = typeof totalAmount === 'string'
      ? parseFloat(totalAmount.replace(/[^\d.]/g, ''))
      : totalAmount;

    // 4. Insert booking (also store user_email as a permanent record)
    const insertQuery = `
      INSERT INTO bookings (user_id, associate_id, package_id, travel_date, total_amount, status, user_email)
      VALUES ($1, $2, $3, $4, $5, 'pending', $6)
      RETURNING *
    `;
    const bookingResult = await pool.query(insertQuery, [
      numericUserId || null,
      finalAssociateId || null,
      numericPackageId,
      travelDate || new Date(),
      cleanAmount,
      userEmail || null
    ]);
    const newBooking = bookingResult.rows[0];

    await pool.query('COMMIT');
    res.status(201).json({
      message: 'Booking created successfully',
      booking: newBooking
    });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Booking creation error:', err);
    res.status(500).json({ error: 'Internal server error while creating booking: ' + err.message });
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
            avatar TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          ALTER TABLE login_details ADD COLUMN IF NOT EXISTS avatar TEXT;

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
            user_email TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          ALTER TABLE bookings ADD COLUMN IF NOT EXISTS user_email TEXT;

          CREATE TABLE IF NOT EXISTS referrals (
            id SERIAL UNIQUE,
            referral_id VARCHAR(50) PRIMARY KEY,
            referrer_id VARCHAR(50),
            referred_user_id INT REFERENCES login_details(user_id),
            referral_type VARCHAR(20) CHECK (referral_type IN ('user','associate')),
            promo_code VARCHAR(50),
            status VARCHAR(20) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS commissions (
            commission_id SERIAL PRIMARY KEY,
            associate_id INT REFERENCES login_details(user_id),
            booking_id INT REFERENCES bookings(booking_id),
            amount NUMERIC(10,2),
            status VARCHAR(20) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          ALTER TABLE commissions ADD COLUMN IF NOT EXISTS level INT;

          CREATE TABLE IF NOT EXISTS payouts (
            payout_id SERIAL PRIMARY KEY,
            associate_id INT REFERENCES login_details(user_id),
            amount NUMERIC(10,2),
            payment_mode VARCHAR(50),
            transaction_reference VARCHAR(100),
            status VARCHAR(20) DEFAULT 'pending',
            paid_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS refunds (
            refund_id SERIAL PRIMARY KEY,
            booking_id INT REFERENCES bookings(booking_id),
            payment_id VARCHAR(100),
            amount NUMERIC(10,2),
            reason TEXT,
            status VARCHAR(20) DEFAULT 'pending',
            refund_date TIMESTAMP,
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
