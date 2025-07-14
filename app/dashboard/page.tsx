'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VoteBarChart, VotePieChart } from '@/components/dashboard/VoteChart';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { TransactionTable } from '@/components/dashboard/TransactionTable';

interface User {
  id: number;
  email: string;
  name: string;
}

interface VoteAnalytics {
  candidate_id: number;
  candidate_name: string;
  candidate_code: string;
  total_votes: number;
  total_amount: number;
  transaction_count: number;
  vote_percentage: string;
}

interface DonationData {
  summary: {
    total_amount: number;
    total_donations: number;
    unique_donors: number;
    average_donation: number;
  };
}

interface Transaction {
  id: number;
  type: 'vote' | 'donation';
  phone: string;
  candidate_name?: string;
  candidate_code?: string;
  votes?: number;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  transaction_id: string;
  created_at: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [voteData, setVoteData] = useState<VoteAnalytics[]>([]);
  const [donationData, setDonationData] = useState<DonationData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
      // Set up auto-refresh every 30 seconds
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [user, pagination.current_page, statusFilter, typeFilter]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchData = async () => {
    try {
      const [voteResponse, donationResponse, transactionResponse] = await Promise.all([
        fetch('/api/analytics/votes'),
        fetch('/api/analytics/donations'),
        fetch(`/api/analytics/transactions?status=${statusFilter}&type=${typeFilter}&page=${pagination.current_page}&limit=${pagination.per_page}`)
      ]);

      if (voteResponse.ok) {
        const voteResult = await voteResponse.json();
        setVoteData(voteResult.analytics || []);
      }

      if (donationResponse.ok) {
        const donationResult = await donationResponse.json();
        setDonationData(donationResult);
      }

      if (transactionResponse.ok) {
        const transactionResult = await transactionResponse.json();
        setTransactions(transactionResult.transactions || []);
        setPagination(transactionResult.pagination);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, current_page: page }));
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  const handleTypeFilter = (type: string) => {
    setTypeFilter(type);
    setPagination(prev => ({ ...prev, current_page: 1 }));
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-carnival-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const totalVotes = voteData.reduce((sum, item) => sum + item.total_votes, 0);
  const totalVoteAmount = voteData.reduce((sum, item) => sum + item.total_amount, 0);
  const totalDonationAmount = donationData?.summary.total_amount || 0;
  const totalRevenue = totalVoteAmount + totalDonationAmount;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Borbor Carnival 25</h1>
              <p className="text-gray-600">Live Voting Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Votes"
            value={totalVotes}
            icon={<div className="text-4xl">🗳️</div>}
          />
          <StatsCard
            title="Total Revenue"
            value={`GH₵${totalRevenue.toFixed(2)}`}
            subtitle={`Votes: GH₵${totalVoteAmount.toFixed(2)} • Donations: GH₵${totalDonationAmount.toFixed(2)}`}
            icon={<div className="text-4xl">💰</div>}
          />
          <StatsCard
            title="Total Donations"
            value={donationData?.summary.total_donations || 0}
            subtitle={`${donationData?.summary.unique_donors || 0} unique donors`}
            icon={<div className="text-4xl">🎭</div>}
          />
          <StatsCard
            title="Active Candidates"
            value={voteData.length}
            icon={<div className="text-4xl">👥</div>}
          />
        </div>

        {/* Leaderboard */}
        {voteData.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">🏆 Candidate Leaderboard</h3>
            <div className="space-y-3">
              {voteData.map((candidate, index) => (
                <div key={candidate.candidate_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-gray-300'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{candidate.candidate_name}</div>
                      <div className="text-sm text-gray-500">Code: {candidate.candidate_code}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{candidate.total_votes.toLocaleString()} votes</div>
                    <div className="text-sm text-gray-500">{candidate.vote_percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Charts */}
        {voteData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <VoteBarChart data={voteData} />
            <VotePieChart data={voteData} />
          </div>
        )}

        {/* Transaction Table */}
        <TransactionTable
          transactions={transactions}
          pagination={pagination}
          onPageChange={handlePageChange}
          onStatusFilter={handleStatusFilter}
          onTypeFilter={handleTypeFilter}
          currentStatus={statusFilter}
          currentType={typeFilter}
        />

        {/* Auto-refresh indicator */}
        <div className="fixed bottom-4 right-4 bg-white rounded-full shadow-lg px-4 py-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live updates</span>
          </div>
        </div>
      </main>
    </div>
  );
}