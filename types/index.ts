export interface Candidate {
  id: number;
  name: string;
  code: string;
  description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Vote {
  id: number;
  candidate_id: number;
  voter_phone: string;
  number_of_votes: number;
  amount_paid: number;
  transaction_id: string;
  transaction_status: 'pending' | 'success' | 'failed';
  transaction_message?: string;
  session_id: string;
  created_at: Date;
  updated_at: Date;
  candidate?: Candidate;
}

export interface Donation {
  id: number;
  donor_phone: string;
  amount: number;
  transaction_id: string;
  transaction_status: 'pending' | 'success' | 'failed';
  transaction_message?: string;
  session_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface UssdSession {
  session_id: string;
  msisdn: string;
  menu_state: string;
  prev_menu_state?: string;
  transaction_data?: any;
  user_id?: string;
  network?: string;
  msg_type?: string;
  user_data?: string;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface VoteAnalytics {
  candidate_id: number;
  candidate_name: string;
  candidate_code: string;
  total_votes: number;
  total_amount: number;
  vote_percentage: number;
}

export interface TransactionAnalytics {
  total_transactions: number;
  successful_transactions: number;
  failed_transactions: number;
  total_amount: number;
  total_votes: number;
  total_donations: number;
}