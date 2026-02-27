-- =========================================
-- 1) LOGIN DETAILS (Users + Associates + Admin)
-- =========================================
CREATE TABLE login_details (
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

-- =========================================
-- 2) ASSOCIATE HIERARCHY (MLM Unilevel)
-- =========================================
CREATE TABLE associate_hierarchy (
    associate_id INT PRIMARY KEY REFERENCES login_details(user_id),
    parent_associate_id INT REFERENCES login_details(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- 3) COMMISSION LEVELS (7 Levels)
-- =========================================
CREATE TABLE commission_levels (
    level INT PRIMARY KEY,
    percentage NUMERIC(5,2)
);

INSERT INTO commission_levels (level, percentage) VALUES
(1, 10.00),
(2, 5.00),
(3, 3.00),
(4, 2.00),
(5, 1.50),
(6, 1.00),
(7, 0.50);

-- =========================================
-- 4) PROMO CODES (Associate Tracking)
-- =========================================
CREATE TABLE promo_codes (
    promo_id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    associate_id INT REFERENCES login_details(user_id),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- 5) PACKAGES (Trips)
-- =========================================
CREATE TABLE packages (
    package_id SERIAL PRIMARY KEY,
    name VARCHAR(200),
    destination VARCHAR(100),
    duration VARCHAR(50),
    price NUMERIC(10,2),
    description TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- 6) BOOKINGS (Main Orders)
-- =========================================
CREATE TABLE bookings (
    booking_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES login_details(user_id),
    associate_id INT REFERENCES login_details(user_id),
    package_id INT REFERENCES packages(package_id),
    travel_date DATE,
    total_amount NUMERIC(10,2),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- 7) PASSENGERS / TRAVELERS
-- =========================================
CREATE TABLE passengers (
    passenger_id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES bookings(booking_id),
    name VARCHAR(150),
    age INT,
    gender VARCHAR(10),
    id_proof VARCHAR(100)
);

-- =========================================
-- 8) PAYMENTS (Installments)
-- =========================================
CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES bookings(booking_id),

    advance_paid NUMERIC(10,2),
    advance_paid_at TIMESTAMP,

    first_installment_paid NUMERIC(10,2),
    first_installment_paid_at TIMESTAMP,

    second_installment_paid NUMERIC(10,2),
    second_installment_paid_at TIMESTAMP,

    third_installment_paid NUMERIC(10,2),
    third_installment_paid_at TIMESTAMP,

    total_amount_paid NUMERIC(10,2),

    method VARCHAR(50),
    status VARCHAR(20),
    transaction_id VARCHAR(100),

    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- 9) REFUNDS / CANCELLATIONS
-- =========================================
CREATE TABLE refunds (
    refund_id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES bookings(booking_id),
    payment_id INT REFERENCES payments(payment_id),
    amount NUMERIC(10,2),
    reason TEXT,
    status VARCHAR(20),
    refund_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- 10) COMMISSIONS (MLM Earnings)
-- =========================================
CREATE TABLE commissions (
    commission_id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES bookings(booking_id),
    associate_id INT REFERENCES login_details(user_id),
    level INT,
    commission_amount NUMERIC(10,2),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =========================================
-- 11) PAYOUTS (Money Given to Associates)
-- =========================================
CREATE TABLE payouts (
    payout_id SERIAL PRIMARY KEY,
    associate_id INT REFERENCES login_details(user_id),
    amount NUMERIC(10,2),
    payment_mode VARCHAR(50),
    transaction_reference VARCHAR(100),
    status VARCHAR(20),
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
