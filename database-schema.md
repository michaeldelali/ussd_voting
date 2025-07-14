# Borbor Carnival 25 - Database Schema

## Tables

### 1. candidates
- `id` (PRIMARY KEY, AUTO_INCREMENT)
- `name` (VARCHAR(255), NOT NULL) - Candidate/Group name
- `code` (VARCHAR(10), UNIQUE, NOT NULL) - Group code (e.g., "013")
- `description` (TEXT, NULLABLE) - Optional description
- `is_active` (BOOLEAN, DEFAULT true)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 2. votes
- `id` (PRIMARY KEY, AUTO_INCREMENT)
- `candidate_id` (FOREIGN KEY to candidates.id)
- `voter_phone` (VARCHAR(15), NOT NULL) - Voter's phone number
- `number_of_votes` (INT, NOT NULL) - Number of votes cast
- `amount_paid` (DECIMAL(10,2), NOT NULL) - Amount paid (GH₵)
- `transaction_id` (VARCHAR(255), UNIQUE) - Payment transaction ID
- `transaction_status` (ENUM: 'pending', 'success', 'failed')
- `transaction_message` (TEXT, NULLABLE)
- `session_id` (VARCHAR(255)) - USSD session ID
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 3. donations
- `id` (PRIMARY KEY, AUTO_INCREMENT)
- `donor_phone` (VARCHAR(15), NOT NULL)
- `amount` (DECIMAL(10,2), NOT NULL)
- `transaction_id` (VARCHAR(255), UNIQUE)
- `transaction_status` (ENUM: 'pending', 'success', 'failed')
- `transaction_message` (TEXT, NULLABLE)
- `session_id` (VARCHAR(255))
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 4. ussd_sessions
- `session_id` (VARCHAR(255), PRIMARY KEY)
- `msisdn` (VARCHAR(15), NOT NULL)
- `menu_state` (VARCHAR(50), NOT NULL)
- `prev_menu_state` (VARCHAR(50), NULLABLE)
- `transaction_data` (JSON, NULLABLE)
- `user_id` (VARCHAR(255), NULLABLE)
- `network` (VARCHAR(50), NULLABLE)
- `msg_type` (VARCHAR(50), NULLABLE)
- `user_data` (TEXT, NULLABLE)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### 5. users (Admin Dashboard)
- `id` (PRIMARY KEY, AUTO_INCREMENT)
- `email` (VARCHAR(255), UNIQUE, NOT NULL)
- `password_hash` (VARCHAR(255), NOT NULL)
- `name` (VARCHAR(255), NOT NULL)
- `is_active` (BOOLEAN, DEFAULT true)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Indexes
- `votes.candidate_id` (for vote counting queries)
- `votes.transaction_status` (for analytics)
- `votes.created_at` (for time-based analytics)
- `donations.transaction_status`
- `donations.created_at`
- `candidates.code` (for quick lookups)
- `ussd_sessions.msisdn` (for session management)