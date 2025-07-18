'use client';

import { useEffect, useState,useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { VoteBarChart, VotePieChart } from '@/components/dashboard/VoteChart';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { TransactionTable } from '@/components/dashboard/TransactionTable';
import { 
  Trophy, 
  DollarSign, 
  Vote, 
  Heart, 
  TrendingUp, 
  RefreshCw, 
  LogOut, 
  Calendar,
  Download,
  Bell,
  Settings,
  BarChart3,
  PieChart,
  Activity,
  Clock,
} from 'lucide-react';

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
  trends?: Array<{
    date: string;
    daily_amount: number;
    daily_count: number;
  }>;
  recent_donations?: Array<{
    amount: number;
    createdAt: string;
    donor_phone: string;
  }>;
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
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [viewMode, setViewMode] = useState<'overview' | 'analytics' | 'live'>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [chartView, setChartView] = useState<'bar' | 'pie'>('bar');
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm] = useState('');

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [viewSettings, setViewSettings] = useState({
    compactMode: false,
    showTrends: true,
    showNotifications: true
  });
  const router = useRouter();

  const checkAuth = useCallback(async () => {
  try {
    const response = await fetch('/api/auth/me');
    if (response.ok) {
      const data = await response.json();
      setUser(data.user);
    } else {
      router.push('/login');
    }
  } catch (error) {
    console.error('Authentication check failed:', error);
    router.push('/login');
  }
}, [router]);

useEffect(() => {
  checkAuth();
}, [checkAuth]);

const fetchData = useCallback(async (page?: number) => {
  try {
    const currentPage = page ?? pagination.current_page;
    const dateParams =
      dateRange.startDate && dateRange.endDate
        ? `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`
        : '';

    const [voteResponse, donationResponse, transactionResponse] =
      await Promise.all([
        fetch(`/api/analytics/votes${dateParams}`),
        fetch(`/api/analytics/donations${dateParams}`),
        fetch(
          `/api/analytics/transactions?status=${statusFilter}&type=${typeFilter}&page=${currentPage}&limit=${pagination.per_page}`
        ),
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

    setLastUpdated(new Date());
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    setLoading(false);
  }
}, [
  dateRange.startDate,
  dateRange.endDate,
  statusFilter,
  typeFilter,
  pagination.per_page,
  pagination.current_page,
]);

useEffect(() => {
  if (user) {
    fetchData();

    if (autoRefresh) {
      const interval = setInterval(() => fetchData(), 30000);
      return () => clearInterval(interval);
    }
  }
}, [user, fetchData, autoRefresh]);
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
    fetchData(page);
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setPagination(prev => ({ ...prev, current_page: 1 }));
    // fetchData will be called by useEffect when statusFilter changes
  };

  const handleTypeFilter = (type: string) => {
    setTypeFilter(type);
    setPagination(prev => ({ ...prev, current_page: 1 }));
    // fetchData will be called by useEffect when typeFilter changes
  };

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    setDateRange(prev => ({ ...prev, [field]: value }));
  };

  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
  };

  const exportData = () => {
    // Create CSV data for export
    const csvData = transactions.map(t => ({
      Type: t.type,
      Phone: t.phone,
      Candidate: t.candidate_name || 'N/A',
      Amount: t.amount,
      Status: t.status,
      Date: new Date(t.created_at).toLocaleDateString()
    }));
    
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carnival-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const filteredTransactions = transactions.filter(t => 
    searchTerm === '' || 
    t.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.candidate_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.transaction_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleViewSettingChange = (setting: string, value: boolean) => {
    setViewSettings(prev => ({ ...prev, [setting]: value }));
  };

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-teal-600 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto"></div>
            <Trophy className="absolute inset-0 m-auto h-6 w-6 text-white" />
          </div>
          <p className="mt-6 text-white text-lg font-medium">Loading Carnival Dashboard...</p>
          <p className="text-purple-200">Preparing live voting data</p>
        </div>
      </div>
    );
  }

  const totalVotes = voteData.reduce((sum, item) => sum + item.total_votes, 0);
  const totalVoteAmount = voteData.reduce((sum, item) => sum + item.total_amount, 0);
  const totalDonationAmount = donationData?.summary.total_amount || 0;
  const totalRevenue = totalVoteAmount + totalDonationAmount;
  const leadingCandidate = voteData.length > 0 ? voteData[0] : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Responsive Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            {/* Left Side - Brand */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={toggleMobileMenu}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden"
              >
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600 bg-clip-text truncate">
                  Borborbor Carnival 25
                </h1>
                <p className="hidden sm:flex text-xs sm:text-sm text-gray-500 items-center">
                  <Activity className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Voting Dashboard
                </p>
              </div>
            </div>

            {/* Right Side - Controls */}
            <div className="flex items-center space-x-1 sm:space-x-3">
              {/* View Mode Switcher - Hidden on mobile */}
              <div className="hidden lg:flex bg-gray-100 rounded-lg p-1">
                {['overview', 'analytics', 'live'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode as 'overview' | 'analytics' | 'live')}
                    className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                      viewMode === mode
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>

              {/* Auto-refresh toggle */}
              <button
                onClick={toggleAutoRefresh}
                className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  autoRefresh
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{autoRefresh ? 'Live' : 'Paused'}</span>
              </button>

              {/* Notifications */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-1.5 sm:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                {totalVotes > 100 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 sm:h-4 sm:w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    !
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="hidden sm:block text-right">
                  <p className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-24 sm:max-w-none">{user?.name}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 sm:space-x-2 bg-red-50 text-red-700 hover:bg-red-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                >
                  <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile View Mode Switcher */}
          <div className="lg:hidden pb-3 border-t border-gray-100 pt-3">
            <div className="flex bg-gray-100 rounded-lg p-1 w-full">
              {['overview', 'analytics', 'live'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode as 'overview' | 'analytics' | 'live')}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === mode
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Responsive Advanced Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="space-y-4">
            {/* First Row - Date Range */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <Calendar className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full">
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                    className="w-full sm:w-auto border text-slate-800 border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <span className="text-gray-500 text-sm hidden sm:inline">to</span>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                    className="w-full sm:w-auto border text-slate-800 border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Second Row - Search and Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              {/* <div className="flex items-center space-x-2 flex-1 min-w-0">
                <Search className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 min-w-0 border text-slate-800 border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div> */}

              <div className="flex items-center space-x-2">
                <button
                  onClick={exportData}
                  className="flex items-center space-x-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </button>

                <button
                  onClick={() => setChartView(chartView === 'bar' ? 'pie' : 'bar')}
                  className="flex items-center space-x-2 bg-gray-50 text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {chartView === 'bar' ? <PieChart className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
                  <span className="hidden sm:inline">{chartView === 'bar' ? 'Pie View' : 'Bar View'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatsCard
            title="Total Votes"
            value={totalVotes}
            subtitle={`${voteData.length} candidates competing`}
            icon={<Vote className="h-8 w-8" />}
            // trend={{
            //   value: "+12%",
            //   isPositive: true
            // }}
          />
          <StatsCard
            title="Total Revenue"
            value={`GH₵${totalRevenue.toFixed(2)}`}
            subtitle={`Votes: GH₵${totalVoteAmount.toFixed(2)} • Donations: GH₵${totalDonationAmount.toFixed(2)}`}
            icon={<DollarSign className="h-8 w-8" />}
            // trend={{
            //   value: "+8%",
            //   isPositive: true
            // }}
          />
          <StatsCard
            title="Total Donations"
            value={donationData?.summary.total_donations || 0}
            subtitle={`${donationData?.summary.unique_donors || 0} unique donors • Avg: GH₵${(donationData?.summary.average_donation || 0).toFixed(2)}`}
            icon={<Heart className="h-8 w-8" />}
            // trend={{
            //   value: "+15%",
            //   isPositive: true
            // }}
          />
          <StatsCard
            title="Leading Candidate"
            value={leadingCandidate?.candidate_name || 'TBD'}
            subtitle={leadingCandidate ? `${leadingCandidate.total_votes} votes (${leadingCandidate.vote_percentage}%)` : 'No votes yet'}
            icon={<Trophy className="h-8 w-8" />}
          />
        </div>

        {viewMode === 'overview' && (
          <>
            {/* Responsive Live Leaderboard */}
            {voteData.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
                  <h3 className="text-lg sm:text-xl font-bold flex items-center">
                    <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-500 mr-2" />
                    Live Leaderboard
                  </h3>
                  <div className="flex items-center text-xs sm:text-sm text-gray-500">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {voteData.map((candidate, index) => (
                    <div key={candidate.candidate_id} className="relative">
                      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 ${
                        index === 0 
                          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-lg' 
                          : index === 1
                          ? 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 shadow-md'
                          : index === 2
                          ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 shadow-md'
                          : 'bg-gray-50 border-gray-100 shadow-sm'
                      }`}>
                        <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-0">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg ${
                            index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 
                            index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' : 
                            index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' : 
                            'bg-gradient-to-br from-gray-300 to-gray-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-base sm:text-lg text-gray-900 truncate">{candidate.candidate_name}</div>
                            <div className="text-xs sm:text-sm text-gray-500">Code: {candidate.candidate_code}</div>
                            <div className="text-xs text-gray-400">{candidate.transaction_count} transactions</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-xl sm:text-2xl text-gray-900">{candidate.total_votes.toLocaleString()}</div>
                          <div className="text-xs sm:text-sm text-gray-500">votes</div>
                          <div className="text-base sm:text-lg font-semibold text-purple-600">{candidate.vote_percentage}%</div>
                        </div>
                      </div>
                      {/* Vote percentage bar */}
                      <div className="mt-2 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ${
                            index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                            index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600' :
                            index === 2 ? 'bg-gradient-to-r from-orange-400 to-red-500' :
                            'bg-gradient-to-r from-blue-400 to-purple-500'
                          }`}
                          style={{ width: `${candidate.vote_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Responsive Charts */}
            {voteData.length > 0 && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="order-2 xl:order-1">
                  {chartView === 'bar' ? (
                    <VoteBarChart data={voteData} />
                  ) : (
                    <VotePieChart data={voteData} />
                  )}
                </div>
                
                {/* Additional insights card */}
                <div className="order-1 xl:order-2 bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-500" />
                    Key Insights
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <span className="text-xs sm:text-sm font-medium text-blue-800">Avg Votes/Transaction</span>
                      <span className="text-xs sm:text-sm text-blue-600">{totalVotes > 0 ? (totalVotes / voteData.reduce((sum, v) => sum + v.transaction_count, 0)).toFixed(1) : '0'}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="text-xs sm:text-sm font-medium text-purple-800">Revenue per Vote</span>
                      <span className="text-xs sm:text-sm text-purple-600">GH₵{totalVotes > 0 ? (totalVoteAmount / totalVotes).toFixed(2) : '0.00'}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="text-xs sm:text-sm font-medium text-orange-800">Competition Level</span>
                      <span className="text-xs sm:text-sm text-orange-600">
                        {voteData.length > 0 && parseFloat(voteData[0].vote_percentage) < 40 ? 'Very Competitive' : 
                         voteData.length > 0 && parseFloat(voteData[0].vote_percentage) < 60 ? 'Competitive' : 'Clear Leader'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {viewMode === 'analytics' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <VoteBarChart data={voteData} />
            <VotePieChart data={voteData} />
          </div>
        )}

        {viewMode === 'live' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-red-500 animate-pulse" />
              Live Activity Feed
            </h3>
            <div className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
              {transactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      transaction.status === 'success' ? 'bg-green-500' :
                      transaction.status === 'pending' ? 'bg-yellow-500 animate-pulse' :
                      'bg-red-500'
                    }`}></div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">
                        {transaction.type === 'vote' ? '🗳️ Vote' : '❤️ Donation'} 
                        {transaction.candidate_name && ` for ${transaction.candidate_name}`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {transaction.phone} • {new Date(transaction.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-auto">
                    <div className="font-semibold text-sm">GH₵{transaction.amount.toFixed(2)}</div>
                    {transaction.votes && (
                      <div className="text-xs text-gray-500">{transaction.votes} votes</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Transaction Table */}
        <TransactionTable
          transactions={filteredTransactions}
          pagination={pagination}
          onPageChange={handlePageChange}
          onStatusFilter={handleStatusFilter}
          onTypeFilter={handleTypeFilter}
          currentStatus={statusFilter}
          currentType={typeFilter}
        />

        {/* Responsive Status Footer & Mobile FAB */}
        <div className="fixed bottom-4 right-4 z-30">
          {/* Mobile Floating Action Button */}
          <div className="lg:hidden mb-3">
            <button
              onClick={toggleMobileMenu}
              className="w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
            >
              <Settings className="h-6 w-6" />
            </button>
          </div>

          {/* Status Footer */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 px-3 sm:px-4 py-2 sm:py-3">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-xs sm:text-sm text-gray-600">{autoRefresh ? 'Live' : 'Paused'}</span>
              </div>
              <div className="h-3 sm:h-4 w-px bg-gray-300"></div>
              <div className="text-xs text-gray-500">
                <span className="hidden sm:inline">{totalVotes} votes • {transactions.length} transactions</span>
                <span className="sm:hidden">{totalVotes}v • {transactions.length}t</span>
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Notifications Panel */}
        {showNotifications && viewSettings.showNotifications && (
          <>
            {/* Mobile Fullscreen Overlay */}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden" onClick={() => setShowNotifications(false)}></div>
            
            {/* Notifications Panel */}
            <div className="fixed top-0 left-0 right-0 bottom-0 bg-white z-50 lg:fixed lg:top-20 lg:right-4 lg:w-80 lg:max-w-[calc(100vw-1rem)] lg:rounded-xl lg:shadow-lg lg:border lg:border-gray-200 lg:bottom-auto lg:left-auto lg:h-auto">
              <div className="p-4 border-b border-gray-200 lg:p-3 lg:sm:p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-base lg:text-sm lg:sm:text-base">Notifications</h3>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-400 hover:text-gray-600 p-2 lg:p-1"
                  >
                    <span className="text-xl lg:text-lg">×</span>
                  </button>
                </div>
              </div>
              <div className="p-4 space-y-3 overflow-y-auto h-full lg:max-h-80 lg:sm:max-h-96 lg:p-3 lg:sm:p-4 pb-20 lg:pb-4">
                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-green-800 lg:text-xs lg:sm:text-sm">Candidates Added</div>
                    <div className="text-xs text-green-600">13 Candidates Added</div>
                  </div>
                </div>
                {totalRevenue > 1000 && (
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-blue-800 lg:text-xs lg:sm:text-sm">Revenue milestone!</div>
                      <div className="text-xs text-blue-600">Total revenue exceeded GH₵1,000</div>
                    </div>
                  </div>
                )}
                
                {/* Additional mobile-friendly notifications */}
                <div className="lg:hidden">
                  <div className="flex items-start space-x-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-purple-800">Dashboard tip</div>
                      <div className="text-xs text-purple-600">Swipe or tap the menu button for quick settings</div>
                    </div>
                  </div>
                  
                  {autoRefresh && (
                    <div className="flex items-start space-x-3 p-3 bg-indigo-50 rounded-lg">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0 animate-pulse"></div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-indigo-800">Live updates active</div>
                        <div className="text-xs text-indigo-600">Data refreshes every {refreshInterval} seconds</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Mobile Sidebar/Drawer */}
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={toggleMobileMenu}
            ></div>
            
            {/* Sidebar */}
            <div className="fixed top-0 left-0 h-full w-80 bg-white shadow-xl z-50 lg:hidden transform transition-transform duration-300 ease-in-out">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Dashboard Settings</h2>
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-600"
                >
                  <span className="text-xl">×</span>
                </button>
              </div>

              <div className="p-4 space-y-6 overflow-y-auto h-full pb-20">
                {/* Quick Stats */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">Total Votes</span>
                      <span className="font-semibold text-purple-600">{totalVotes}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">Revenue</span>
                      <span className="font-semibold text-green-600">GH₵{totalRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm text-gray-600">Transactions</span>
                      <span className="font-semibold text-blue-600">{transactions.length}</span>
                    </div>
                  </div>
                </div>

                {/* View Settings */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">View Settings</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Compact Mode</span>
                      <input
                        type="checkbox"
                        checked={viewSettings.compactMode}
                        onChange={(e) => handleViewSettingChange('compactMode', e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Show Trends</span>
                      <input
                        type="checkbox"
                        checked={viewSettings.showTrends}
                        onChange={(e) => handleViewSettingChange('showTrends', e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </label>
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Notifications</span>
                      <input
                        type="checkbox"
                        checked={viewSettings.showNotifications}
                        onChange={(e) => handleViewSettingChange('showNotifications', e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </label>
                  </div>
                </div>

                {/* Refresh Settings */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Auto Refresh</h3>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Enable Auto Refresh</span>
                      <input
                        type="checkbox"
                        checked={autoRefresh}
                        onChange={toggleAutoRefresh}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </label>
                    {autoRefresh && (
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Refresh Interval (seconds)</label>
                        <select
                          value={refreshInterval}
                          onChange={(e) => setRefreshInterval(Number(e.target.value))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                        >
                          <option value={10}>10 seconds</option>
                          <option value={30}>30 seconds</option>
                          <option value={60}>1 minute</option>
                          <option value={300}>5 minutes</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={exportData}
                      className="w-full flex items-center justify-center space-x-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Download className="h-4 w-4" />
                      <span>Export Data</span>
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="w-full flex items-center justify-center space-x-2 bg-gray-50 text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Refresh Page</span>
                    </button>
                  </div>
                </div>

                {/* Leading Candidate */}
                {leadingCandidate && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Current Leader</h3>
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                          <Trophy className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">{leadingCandidate.candidate_name}</div>
                          <div className="text-xs text-gray-600">{leadingCandidate.total_votes} votes ({leadingCandidate.vote_percentage}%)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}