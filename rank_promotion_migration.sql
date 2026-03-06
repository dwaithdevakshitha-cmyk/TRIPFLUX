-- Database Migration: MLM Rank Promotion System
-- Date: 2026-03-06

-- 1. Add rank column to login_details
ALTER TABLE login_details ADD COLUMN IF NOT EXISTS rank VARCHAR(50) DEFAULT 'Associate';

-- 2. Create rank_levels table
CREATE TABLE IF NOT EXISTS rank_levels (
    rank_id SERIAL PRIMARY KEY,
    rank_name VARCHAR(100) UNIQUE NOT NULL,
    turnover_required NUMERIC(15,2) NOT NULL,
    level_order INT NOT NULL
);

-- 3. Insert default rank levels
INSERT INTO rank_levels (rank_name, turnover_required, level_order) VALUES
('Associate', 0, 1),
('Bronze Associate', 100000, 2),
('Silver Associate', 500000, 3),
('Gold Associate', 1000000, 4),
('Diamond Associate', 2500000, 5),
('Platinum Associate', 5000000, 6),
('Crown Associate', 10000000, 7)
ON CONFLICT (rank_name) DO NOTHING;

-- 4. (Optional but recommended) Update any existing null ranks
UPDATE login_details SET rank = 'Associate' WHERE rank IS NULL;
