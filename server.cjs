const express = require('express');
const { Pool } = require('pg');
const { GoogleGenerativeAI } = require("@google/genai");
const cors = require('cors');
const logger = require('./services/logger.cjs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Use custom logging middleware
app.use(logger.requestLogger);

async function updateAssociateRank(associateId) {
  if (!associateId) return;
  try {
    const rankLevelsRes = await pool.query('SELECT rank_name as name, turnover_required as min FROM rank_levels ORDER BY turnover_required DESC');
    const dynamicRankThresholds = rankLevelsRes.rows;

    const turnoverQuery = `
      WITH RECURSIVE downline AS (
        SELECT associate_id FROM associate_hierarchy WHERE associate_id = $1
        UNION ALL
        SELECT h.associate_id FROM associate_hierarchy h
        INNER JOIN downline d ON h.parent_associate_id = d.associate_id
      )
      SELECT COALESCE(SUM(total_amount), 0)::numeric as total_turnover
      FROM bookings
      WHERE status = 'confirmed' AND (associate_id = $1 OR associate_id IN (SELECT associate_id FROM downline))
    `;
    const turnoverRes = await pool.query(turnoverQuery, [associateId]);
    const turnover = parseFloat(turnoverRes.rows[0].total_turnover || 0);

    let newRank = 'Associate';
    for (const threshold of dynamicRankThresholds) {
      if (turnover >= threshold.min) {
        newRank = threshold.name;
        break;
      }
    }

    await pool.query('UPDATE login_details SET rank = $1 WHERE user_id = $2', [newRank, associateId]);

    const parentQuery = 'SELECT parent_associate_id FROM associate_hierarchy WHERE associate_id = $1';
    const parentRes = await pool.query(parentQuery, [associateId]);
    if (parentRes.rows.length > 0 && parentRes.rows[0].parent_associate_id) {
      await updateAssociateRank(parentRes.rows[0].parent_associate_id);
    }
  } catch (err) {
    console.error(`Error updating rank for associate ${associateId}:`, err);
  }
}

const fs = require('fs');

const poolConfig = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
};

if (process.env.NODE_ENV === 'production') {
  poolConfig.ssl = {
    rejectUnauthorized: true,
    ca: fs.readFileSync('/certs/global-bundle.pem').toString(),
  };
}

const pool = new Pool(poolConfig);

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
      id: row.custom_id || row.id.toString(),
      title: row.title,
      category: row.category,
      destination: row.destination,
      duration: row.duration,
      price: `₹${parseFloat(row.price || 0).toLocaleString('en-IN')}`,
      description: row.description,
      dates: row.dates,
      priceBasis: row.price_basis,
      priceAdvance: row.price_advance,
      highlights: row.highlights || [],
      image: row.image,
      transportType: row.transport_type,
      contactPhone: row.contact_phone,
      contactEmail: row.contact_email,
      features: row.features || [],
      terms: row.terms || [],
      mediaFiles: row.media_files || [],
      itinerary: row.itinerary || [],
      location: row.location,
      track: row.track
    }));

    res.json(formatted);
  } catch (err) {
    console.error('Error fetching packages:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Registration endpoint
app.post('/api/register', async (req, res) => {
  console.log('REGISTRATION REQUEST BODY:', req.body);
  const { firstName, lastName, email, phone, password, role, panNumber, dateOfBirth, referralCode } = req.body;

  // Backend Validation: Email
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/;
    if (!email) return 'Email is required';
    if (email.includes(' ')) return 'Spaces are not allowed in email';
    if (!email.includes('@')) return 'Email must contain @ symbol';
    if (!emailRegex.test(email)) {
      const [username] = email.split('@');
      if (username.startsWith('.') || username.endsWith('.')) return 'Username cannot start or end with a dot';
      return 'Invalid email format (username@domain.com)';
    }
    return '';
  };

  const emailErr = validateEmail(email);
  if (emailErr && (!phone || phone.trim() === '')) {
    return res.status(400).json({ error: emailErr });
  }

  // Backend Validation: Phone Number (India Rules)
  const validatePhone = (phone) => {
    if (!phone) return 'Phone number is required';
    if (!/^\d+$/.test(phone.toString())) return 'Only numbers (0-9) are allowed';
    if (phone.toString().length !== 10) return 'Phone number must be exactly 10 digits';
    if (!/^[6-9]/.test(phone.toString())) return 'Number must start with 6, 7, 8, or 9';
    return '';
  };

  if (role === 'associate' || (role === 'user' && phone && phone.trim() !== '')) {
    const phoneErr = validatePhone(phone);
    if (phoneErr) {
      return res.status(400).json({ error: phoneErr });
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

        // Insert into referrals table
        const refResult = await pool.query(`
          INSERT INTO referrals (referral_id, referrer_id, referred_user_id, referral_type, promo_code)
          VALUES ('temp', $1, $2, $3, $4)
          RETURNING id
        `, [referrerId, newUser.user_id, role, referralCode]);

        const seqId = refResult.rows[0].id;
        const referralIdStr = `refl${seqId}`;

        // Update the referral_id to include the prefix
        await pool.query(`
          UPDATE referrals 
          SET referral_id = $1 
          WHERE id = $2
        `, [referralIdStr, seqId]);

        // Populate associate_hierarchy for MLM tracking
        if (role === 'associate') {
          // Verify referrer is an associate to serve as parent
          const parentResult = await pool.query(
            'SELECT role FROM login_details WHERE user_id = $1',
            [referrerId]
          );
          if (parentResult.rows.length > 0 && parentResult.rows[0].role === 'associate') {
            await pool.query(
              'INSERT INTO associate_hierarchy (associate_id, parent_associate_id) VALUES ($1, $2)',
              [newUser.user_id, referrerId]
            );
          }
        }
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
    // Resolve userId to a real numeric user_id from login_details
    let numericUserId = parseInt(userId);

    if (isNaN(numericUserId) || numericUserId > 2147483647) {
      // userId is a custom_user_id, associate_id, or similar string -- look it up
      const lookup = await pool.query(
        'SELECT user_id FROM login_details WHERE custom_user_id = $1 OR associate_id = $1 LIMIT 1',
        [userId.toString()]
      );
      if (lookup.rows.length > 0) {
        numericUserId = lookup.rows[0].user_id;
      } else {
        // Nothing found — return empty, not an error
        return res.json([]);
      }
    }

    const query = `
      SELECT r.referral_id, r.referral_type, r.promo_code, r.status, r.created_at,
             l.first_name, l.last_name, l.email, l.custom_user_id, l.associate_id
      FROM referrals r
      JOIN login_details l ON r.referred_user_id = l.user_id
      WHERE r.referrer_id = $1
      ORDER BY r.created_at DESC
    `;
    const result = await pool.query(query, [numericUserId]);
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

// Get user bookings (with passenger count)
app.get('/api/bookings/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    // Resolve userId to numeric
    let numericId = parseInt(userId);
    if (isNaN(numericId) || numericId > 2147483647) {
      const lookup = await pool.query(
        'SELECT user_id FROM login_details WHERE custom_user_id = $1 OR associate_id = $1 LIMIT 1',
        [userId.toString()]
      );
      numericId = lookup.rows.length > 0 ? lookup.rows[0].user_id : null;
    }
    if (!numericId) return res.json([]);

    const query = `
      SELECT b.booking_id, b.travel_date, b.total_amount, b.status, b.created_at,
             p.name as package_name, p.destination,
             COUNT(ps.passenger_id)::int as passenger_count
      FROM bookings b
      LEFT JOIN packages p ON b.package_id = p.package_id
      LEFT JOIN passengers ps ON b.booking_id = ps.booking_id
      WHERE b.user_id = $1
      GROUP BY b.booking_id, p.name, p.destination
      ORDER BY b.created_at DESC
    `;
    const result = await pool.query(query, [numericId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get passengers for a specific booking
app.get('/api/bookings/:bookingId/passengers', async (req, res) => {
  const { bookingId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM passengers WHERE booking_id = $1 ORDER BY passenger_id ASC',
      [parseInt(bookingId)]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching passengers:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new booking
app.post('/api/bookings', async (req, res) => {
  const { userId, userEmail, packageId, travelDate, totalAmount, promoCode, associateId: providedAssociateId, passengers } = req.body;

  if (!userId || !packageId || !totalAmount) {
    return res.status(400).json({ error: 'Missing required booking information' });
  }

  // Require at least one passenger with a name
  const validPassengers = Array.isArray(passengers) ? passengers.filter(p => p.name && p.name.trim()) : [];
  if (validPassengers.length === 0) {
    return res.status(400).json({ error: 'At least one passenger with a name is required.' });
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

    // Check associateId 
    let finalAssociateId = null;
    let numericProvidedAssociateId = parseInt(providedAssociateId);
    if (!isNaN(numericProvidedAssociateId) && numericProvidedAssociateId <= 2147483647) {
      finalAssociateId = numericProvidedAssociateId;
    } else if (providedAssociateId) {
      const ascLookup = await pool.query('SELECT user_id FROM login_details WHERE associate_id = $1 LIMIT 1', [providedAssociateId.toString()]);
      if (ascLookup.rows.length > 0) {
        finalAssociateId = ascLookup.rows[0].user_id;
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

    // 2. Determine associate_id for the booking
    // Priority: (a) explicitly provided associateId, (b) promo code, (c) referrals table

    // (a) Already resolved above from providedAssociateId

    // (b) If promo code provided, look up associate from promo_codes
    if (promoCode && !finalAssociateId) {
      const promoResult = await pool.query(
        "SELECT associate_id FROM promo_codes WHERE code = $1 AND status = 'active' LIMIT 1",
        [promoCode]
      );
      if (promoResult.rows.length > 0) {
        finalAssociateId = promoResult.rows[0].associate_id;
      }
    }

    // (c) If still no associate and user is in DB, look up who referred this user in the referrals table.
    //     referrer_id is now a real integer (login_details.user_id) — no string parsing needed.
    if (!finalAssociateId && numericUserId) {
      try {
        const refResult = await pool.query(
          `SELECT referrer_id FROM referrals WHERE referred_user_id = $1 AND status = 'active' LIMIT 1`,
          [numericUserId]
        );
        if (refResult.rows.length > 0 && refResult.rows[0].referrer_id) {
          const candidateId = refResult.rows[0].referrer_id;
          // Verify they are an associate (not a plain user) before linking
          const roleCheck = await pool.query(
            `SELECT user_id FROM login_details WHERE user_id = $1 AND role = 'associate' LIMIT 1`,
            [candidateId]
          );
          if (roleCheck.rows.length > 0) {
            finalAssociateId = candidateId;
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

    // Insert valid passengers
    for (const p of validPassengers) {
      await pool.query(
        `INSERT INTO passengers (booking_id, name, age, gender, id_proof) VALUES ($1, $2, $3, $4, $5)`,
        [newBooking.booking_id, p.name.trim(), parseInt(p.age) || 0, p.gender || 'Not Specified', p.id_proof ? p.id_proof.trim() : null]
      );
    }

    // Automatic multi-level commission generation
    // bookings.associate_id = the referring associate (Level 1 earner)
    // Their parent = Level 2, grandparent = Level 3, and so on.
    // Only users with role='associate' receive commissions.
    // Multi-level Commission Generation
    if (newBooking.associate_id) {
      try {
        const commLevelRes = await pool.query('SELECT level, percentage FROM commission_levels ORDER BY level ASC');
        const commLevels = commLevelRes.rows;
        const maxLevel = commLevels.length > 0 ? Math.max(...commLevels.map(c => c.level)) : 7;

        let currentAssociateId = newBooking.associate_id; // Level 1 is the direct referrer
        let currentLevel = 1;

        while (currentAssociateId && currentLevel <= maxLevel) {
          // Verify current recipient is an active associate
          const assocCheck = await pool.query(
            "SELECT user_id FROM login_details WHERE user_id = $1 AND role = 'associate'",
            [currentAssociateId]
          );

          if (assocCheck.rows.length > 0) {
            const levelData = commLevels.find(c => c.level === currentLevel);
            const percentage = levelData ? parseFloat(levelData.percentage) : 0;

            if (percentage > 0) {
              const commissionAmount = parseFloat(newBooking.total_amount) * (percentage / 100);
              await pool.query(
                `INSERT INTO commissions (booking_id, associate_id, level, commission_amount, status, created_at)
                 VALUES ($1, $2, $3, $4, 'pending', CURRENT_TIMESTAMP)`,
                [newBooking.booking_id, currentAssociateId, currentLevel, commissionAmount]
              );
            }
          }

          // Move up the hierarchy
          const parentResult = await pool.query(
            "SELECT parent_associate_id FROM associate_hierarchy WHERE associate_id = $1",
            [currentAssociateId]
          );

          if (parentResult.rows.length > 0 && parentResult.rows[0].parent_associate_id) {
            currentAssociateId = parentResult.rows[0].parent_associate_id;
            currentLevel++;
          } else {
            currentAssociateId = null; // End of hierarchy
          }
        }
      } catch (commErr) {
        console.error('Commission generation failed:', commErr);
        // We don't necessarily want to fail the whole booking if commission fails,
        // but the user's hierarchy requirement makes it critical.
      }
    }

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

// Update Booking Status
app.patch('/api/bookings/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['confirmed', 'failed', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const result = await pool.query(
      'UPDATE bookings SET status = $1 WHERE booking_id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const booking = result.rows[0];
    if (status === 'confirmed' && booking.associate_id) {
      await updateAssociateRank(booking.associate_id);
    }

    res.json({ message: `Booking status updated to ${status}`, booking });
  } catch (err) {
    console.error('Status update error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get associate summary (Rank, Turnover, Next Rank)
app.get('/api/associate/summary/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    let numericId = parseInt(userId);
    if (isNaN(numericId) || numericId > 2147483647) {
      const lookup = await pool.query(
        'SELECT user_id FROM login_details WHERE custom_user_id = $1 OR associate_id = $1 LIMIT 1',
        [userId.toString()]
      );
      numericId = lookup.rows.length > 0 ? lookup.rows[0].user_id : null;
    }
    if (!numericId) return res.status(404).json({ error: 'Associate not found' });

    const turnoverQuery = `
      WITH RECURSIVE downline AS (
        SELECT associate_id FROM associate_hierarchy WHERE associate_id = $1
        UNION ALL
        SELECT h.associate_id FROM associate_hierarchy h
        INNER JOIN downline d ON h.parent_associate_id = d.associate_id
      )
      SELECT COALESCE(SUM(total_amount), 0)::numeric as total_turnover
      FROM bookings
      WHERE status = 'confirmed' AND (associate_id = $1 OR associate_id IN (SELECT associate_id FROM downline))
    `;
    const turnoverRes = await pool.query(turnoverQuery, [numericId]);
    const turnover = parseFloat(turnoverRes.rows[0].total_turnover || 0);

    const userRes = await pool.query('SELECT rank FROM login_details WHERE user_id = $1', [numericId]);
    const currentRank = userRes.rows[0].rank || 'Associate';

    const rankLevelsRes = await pool.query('SELECT rank_name as name, turnover_required as min FROM rank_levels ORDER BY level_order ASC');
    const dynamicRankThresholds = rankLevelsRes.rows;

    let nextRank = null;
    let nextThreshold = 0;
    for (const threshold of dynamicRankThresholds) {
      if (turnover < threshold.min) {
        nextRank = threshold.name;
        nextThreshold = parseFloat(threshold.min);
        break;
      }
    }

    res.json({
      currentRank,
      teamTurnover: turnover,
      nextRank,
      nextThreshold,
      requiredMore: nextRank ? Math.max(0, nextThreshold - turnover) : 0
    });
  } catch (err) {
    console.error('Error fetching associate summary:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin: Associate Rankings
app.get('/api/admin/associate-rankings', async (req, res) => {
  try {
    const query = `
      WITH RECURSIVE all_downlines AS (
        SELECT associate_id, associate_id as root_id FROM associate_hierarchy
        UNION ALL
        SELECT h.associate_id, ad.root_id FROM associate_hierarchy h
        INNER JOIN all_downlines ad ON h.parent_associate_id = ad.associate_id
      ),
      turnover_per_root AS (
        SELECT root_id, SUM(b.total_amount) as turnover
        FROM (
          SELECT root_id, associate_id FROM all_downlines
          UNION
          SELECT user_id as root_id, user_id as associate_id FROM login_details WHERE role = 'associate'
        ) heir
        JOIN bookings b ON heir.associate_id = b.associate_id
        WHERE b.status = 'confirmed'
        GROUP BY root_id
      ),
      direct_downline_counts AS (
        SELECT parent_associate_id as user_id, COUNT(*) as count
        FROM associate_hierarchy
        GROUP BY parent_associate_id
      )
      SELECT 
        l.first_name || ' ' || l.last_name as name,
        l.associate_id as custom_id,
        l.rank,
        COALESCE(t.turnover, 0) as team_turnover,
        COALESCE(d.count, 0) as downline_count
      FROM login_details l
      LEFT JOIN turnover_per_root t ON l.user_id = t.root_id
      LEFT JOIN direct_downline_counts d ON l.user_id = d.user_id
      WHERE l.role = 'associate'
      ORDER BY team_turnover DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching associate rankings:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Record Payment Transaction
app.post('/api/payments', async (req, res) => {
  const { booking_id, amount, method, transaction_id, status } = req.body;

  if (!booking_id || !amount || !method) {
    return res.status(400).json({ error: 'Missing payment information' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO payments (booking_id, total_amount_paid, method, transaction_id, status, payment_date) 
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP) RETURNING *`,
      [booking_id, amount, method, transaction_id || null, status || 'success']
    );

    res.status(201).json({
      message: 'Payment recorded successfully',
      payment: result.rows[0]
    });
  } catch (err) {
    console.error('Payment record error:', err);
    res.status(500).json({ error: 'Internal server error while recording payment' });
  }
});

// Admin: Create Packages
app.post('/api/admin/packages', async (req, res) => {
  const { name, destination, duration, price, description, status, custom_id, itinerary } = req.body;
  try {
    await pool.query('BEGIN');
    const result = await pool.query(
      `INSERT INTO packages (name, destination, duration, price, description, status) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING package_id`,
      [name, destination, duration, price, description, status || 'active']
    );
    const newPackageId = result.rows[0].package_id;

    if (itinerary && Array.isArray(itinerary)) {
      for (const day of itinerary) {
        await pool.query(
          `INSERT INTO package_itinerary (package_id, day_number, title, activities) VALUES ($1, $2, $3, $4)`,
          [newPackageId, day.day_number, day.title, JSON.stringify(day.activities || [])]
        );
      }
    }

    await pool.query('COMMIT');
    res.status(201).json({ message: 'Package created successfully', package_id: newPackageId });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Error creating package:', err);
    res.status(500).json({ error: 'Internal server error: ' + err.message });
  }
});

// Admin: Make Payout to Associate
// Admin: Make Payout to Associate
app.post('/api/admin/payouts', async (req, res) => {
  const { associate_id, amount, payment_mode, transaction_reference, commission_ids } = req.body;
  try {
    await pool.query('BEGIN');

    // 1. Insert Payout Record
    const payoutResult = await pool.query(
      `INSERT INTO payouts (associate_id, amount, payment_mode, transaction_reference, status, paid_at, created_at) 
       VALUES ($1, $2, $3, $4, 'paid', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`,
      [associate_id, amount, payment_mode, transaction_reference]
    );

    // 2. Update linked commissions to 'paid' if IDs were provided
    if (commission_ids && Array.isArray(commission_ids) && commission_ids.length > 0) {
      await pool.query(
        `UPDATE commissions SET status = 'paid' WHERE commission_id = ANY($1::int[])`,
        [commission_ids]
      );
    }

    await pool.query('COMMIT');
    res.status(201).json({ message: 'Payout processed successfully', payout: payoutResult.rows[0] });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('Payout processing error:', err);
    res.status(500).json({ error: 'Internal server error while processing payout' });
  }
});

// Admin: Issue Refund
app.post('/api/admin/refunds', async (req, res) => {
  const { booking_id, payment_id, amount, reason } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO refunds (booking_id, payment_id, amount, reason, status) 
       VALUES ($1, $2, $3, $4, 'processed') RETURNING *`,
      [booking_id, payment_id, amount, reason]
    );
    res.status(201).json({ message: 'Refund recorded', refund: result.rows[0] });
  } catch (err) {
    console.error('Refund creation error:', err);
    res.status(500).json({ error: 'Internal server error while processing refund' });
  }
});

// AI Banner Content Generation (Internal Mock for Phase 1)
app.post('/api/admin/generate-banner-content', async (req, res) => {
  const { packageId, targetLanguage } = req.body;

  if (!packageId) {
    return res.status(400).json({ error: 'Package ID is required' });
  }

  try {
    // 1. Fetch package details - Try packages (integer ID) then signature_tours (string ID)
    let pkg;
    let itinerary = [];

    // Check if packageId is purely numeric
    const isNumeric = /^\d+$/.test(packageId.toString());

    if (isNumeric) {
      const pkgResult = await pool.query('SELECT * FROM packages WHERE package_id = $1', [parseInt(packageId)]);
      pkg = pkgResult.rows[0];
      if (pkg) {
        const itinResult = await pool.query('SELECT * FROM package_itinerary WHERE package_id = $1 ORDER BY day_number ASC', [pkg.package_id]);
        itinerary = itinResult.rows;
      }
    }

    if (!pkg) {
      const sigResult = await pool.query('SELECT * FROM signature_tours WHERE id = $1', [packageId]);
      pkg = sigResult.rows[0];
      if (pkg) {
        pkg.name = pkg.title; // Normalize name
        itinerary = pkg.itinerary || [];
      }
    }

    if (!pkg) {
      return res.status(404).json({ error: 'Package not found in any table' });
    }

    // Phase 2: Real AI logic with Fallback
    let points = [];
    const targetLang = targetLanguage || 'English';
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
          You are a professional travel marketing expert. 
          Summarize this tour package: "${pkg.name}" for destination "${pkg.destination}".
          Itinerary summary: ${JSON.stringify(itinerary.slice(0, 3))}
          Output exactly 5 catchy, short marketing bullet points for a visual banner.
          Target Language: ${targetLang}
          Output only the bullet points, one per line, no numbers.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        points = responseText.split('\n').filter(p => p.trim() !== '').slice(0, 5);
      } catch (aiErr) {
        console.warn('AI Generation failed, using fallback:', aiErr.message);
      }
    }

    if (points.length === 0) {
      const summaries = {
        'Telugu': [
          'అద్భుతమైన పర్యటన అనుభవం',
          'సురక్షితమైన మరియు సౌకర్యవంతమైన ప్రయాణం',
          'రుచికరమైన ఆహారం మరియు వసతి',
          'ప్రధాన దర్శనీయ ప్రదేశాల సందర్శన',
          'అనుభవజ్ఞులైన గైడ్ సహాయం'
        ],
        'Hindi': [
          'शानदार पर्यटन अनुभव',
          'सुरक्षित और आरामदायक यात्रा',
          'स्वादिष्ट भोजन और आवास',
          'मुख्य दर्शनीय स्थलों की यात्रा',
          'अनुभवी गाइड की सहायता'
        ],
        'English': [
          'Amazing Tour Experience',
          'Safe and Comfortable Journey',
          'Delicious Food & Accommodation',
          'Visit to Major Attractions',
          'Experienced Guide Assistance'
        ]
      };
      points = summaries[targetLang] || summaries['English'];
    }

    // Metadata extraction for icons
    const transportType = pkg.travel_type || 'Bus'; // Default to Bus like the user examples

    res.json({
      title: pkg.name,
      destination: pkg.destination,
      duration: pkg.duration,
      price: pkg.price,
      points: points,
      transportType: transportType,
      language: targetLang,
      package_id: packageId
    });

  } catch (err) {
    console.error('Error generating banner content:', err);
    res.status(500).json({ error: 'Internal server error while generating banner content' });
  }
});

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
            rank VARCHAR(50) DEFAULT 'Associate',
            avatar TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          ALTER TABLE login_details ADD COLUMN IF NOT EXISTS rank VARCHAR(50) DEFAULT 'Associate';
          
          CREATE TABLE IF NOT EXISTS rank_levels (
            rank_id SERIAL PRIMARY KEY,
            rank_name VARCHAR(100) UNIQUE NOT NULL,
            turnover_required NUMERIC(15,2) NOT NULL,
            level_order INT NOT NULL
          );

          INSERT INTO rank_levels (rank_name, turnover_required, level_order) VALUES
          ('Associate', 0, 1),
          ('Bronze Associate', 100000, 2),
          ('Silver Associate', 500000, 3),
          ('Gold Associate', 1000000, 4),
          ('Diamond Associate', 2500000, 5),
          ('Platinum Associate', 5000000, 6),
          ('Crown Associate', 10000000, 7)
          ON CONFLICT (rank_name) DO NOTHING;

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
            dates VARCHAR(100),
            travel_type VARCHAR(50) DEFAULT 'flight',
            status VARCHAR(20) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          ALTER TABLE packages ADD COLUMN IF NOT EXISTS dates VARCHAR(100);
          ALTER TABLE packages ADD COLUMN IF NOT EXISTS travel_type VARCHAR(50) DEFAULT 'flight';

          CREATE TABLE IF NOT EXISTS package_itinerary (
            itinerary_id SERIAL PRIMARY KEY,
            package_id INT REFERENCES packages(package_id),
            day_number INT,
            title VARCHAR(200),
            activities JSONB DEFAULT '[]'
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

          CREATE TABLE IF NOT EXISTS passengers (
            passenger_id SERIAL PRIMARY KEY,
            booking_id INT REFERENCES bookings(booking_id),
            name VARCHAR(150),
            age INT,
            gender VARCHAR(10),
            id_proof VARCHAR(100)
          );

          CREATE TABLE IF NOT EXISTS referrals (
            id SERIAL UNIQUE,
            referral_id VARCHAR(50) PRIMARY KEY,
            referrer_id INT REFERENCES login_details(user_id),
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
            commission_amount NUMERIC(10,2),
            status VARCHAR(20) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );

          ALTER TABLE commissions ADD COLUMN IF NOT EXISTS level INT;
          ALTER TABLE commissions ADD COLUMN IF NOT EXISTS commission_amount NUMERIC(10,2);

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
