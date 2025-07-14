-- Borbor Carnival 25 - Database Setup
-- Run this script to create the database tables

CREATE DATABASE IF NOT EXISTS borbor_carnival_voting;
USE borbor_carnival_voting;

-- Candidates table
CREATE TABLE IF NOT EXISTS candidates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    candidate_id INT NOT NULL,
    voter_phone VARCHAR(15) NOT NULL,
    number_of_votes INT NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    transaction_id VARCHAR(255) NOT NULL UNIQUE,
    transaction_status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
    transaction_message TEXT,
    session_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id)
);

-- Donations table
CREATE TABLE IF NOT EXISTS donations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    donor_phone VARCHAR(15) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    transaction_id VARCHAR(255) NOT NULL UNIQUE,
    transaction_status ENUM('pending', 'success', 'failed') DEFAULT 'pending',
    transaction_message TEXT,
    session_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- USSD Sessions table
CREATE TABLE IF NOT EXISTS ussd_sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    msisdn VARCHAR(15) NOT NULL,
    menu_state VARCHAR(50) NOT NULL,
    prev_menu_state VARCHAR(50),
    transaction_data JSON,
    user_id VARCHAR(255),
    network VARCHAR(50),
    msg_type VARCHAR(50),
    user_data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users table (for dashboard authentication)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_votes_candidate_id ON votes(candidate_id);
CREATE INDEX idx_votes_transaction_status ON votes(transaction_status);
CREATE INDEX idx_votes_created_at ON votes(created_at);
CREATE INDEX idx_donations_transaction_status ON donations(transaction_status);
CREATE INDEX idx_donations_created_at ON donations(created_at);
CREATE INDEX idx_candidates_code ON candidates(code);
CREATE INDEX idx_ussd_sessions_msisdn ON ussd_sessions(msisdn);

-- Insert sample candidates
INSERT IGNORE INTO candidates (name, code, description) VALUES
('AGBEYEYE', '001', 'Group AGBEYEYE'),
('MAWUTORNAMI', '002', 'Group MAWUTORNAMI'),
('EMMANUEL', '003', 'Group EMMANUEL'),
('SEDEM', '004', 'Group SEDEM'),
('ELORM', '005', 'Group ELORM'),
('MAWUMENYO', '006', 'Group MAWUMENYO'),
('ASOGLI', '007', 'Group ASOGLI'),
('KEKELI', '008', 'Group KEKELI'),
('UNITY', '009', 'Group UNITY'),
('MAWUEWOE', '010', 'Group MAWUEWOE'),
('AMENUVEVE', '011', 'Group AMENUVEVE'),
('HEAVEN GATE', '012', 'Group HEAVEN GATE'),
('ELIKEM', '013', 'Group ELIKEM'),
('MINAMIWOE', '014', 'Group MINAMIWOE'),
('ZORDEDE', '015', 'Group ZORDEDE'),
('MARANATHA', '016', 'Group MARANATHA');


-- Insert admin user (password is bcrypt hash of 'admin123')
INSERT IGNORE INTO users (email, password_hash, name) VALUES
('admin@borbor.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2/1QzwK.7q', 'Admin User');

COMMIT;