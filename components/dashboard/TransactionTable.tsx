'use client';

import { useState } from 'react';
import { Vote, Heart, Clock, CheckCircle, XCircle, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

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

interface TransactionTableProps {
  transactions: Transaction[];
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
  onPageChange: (page: number) => void;
  onStatusFilter: (status: string) => void;
  onTypeFilter: (type: string) => void;
  currentStatus: string;
  currentType: string;
}

export function TransactionTable({ 
  transactions, 
  pagination, 
  onPageChange, 
  onStatusFilter, 
  onTypeFilter,
  currentStatus,
  currentType
}: TransactionTableProps) {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'success':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            <CheckCircle className="w-3 h-3 mr-1" />
            Success
          </span>
        );
      case 'failed':
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </span>
        );
      case 'pending':
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            <Clock className="w-3 h-3 mr-1 animate-spin" />
            Pending
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            Unknown
          </span>
        );
    }
  };

  const getTypeBadge = (type: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (type) {
      case 'vote':
        return (
          <span className={`${baseClasses} bg-purple-100 text-purple-800`}>
            <Vote className="w-3 h-3 mr-1" />
            Vote
          </span>
        );
      case 'donation':
        return (
          <span className={`${baseClasses} bg-pink-100 text-pink-800`}>
            <Heart className="w-3 h-3 mr-1" />
            Donation
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            {type}
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4 sm:p-6 border-b border-gray-200">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-base sm:text-lg font-semibold flex items-center">
            <Eye className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-500" />
            Transaction History
          </h3>
          
          <div className="flex text-slate-800 flex-col sm:flex-row gap-2">
            <select
              value={currentType}
              onChange={(e) => onTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="votes">Votes Only</option>
              <option value="donations">Donations Only</option>
            </select>
            
            <select
              value={currentStatus}
              onChange={(e) => onStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <>
                <tr key={`${transaction.type}-${transaction.id}`} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getTypeBadge(transaction.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                    {transaction.phone}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {transaction.type === 'vote' ? (
                      <div>
                        <div className="font-medium text-gray-900">{transaction.candidate_name}</div>
                        <div className="text-gray-500 text-xs">
                          Code: {transaction.candidate_code} • {transaction.votes} votes
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-500">Donation to Carnival</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    GH₵{transaction.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(transaction.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{new Date(transaction.created_at).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-400">
                      {new Date(transaction.created_at).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => setExpandedRow(expandedRow === transaction.id ? null : transaction.id)}
                      className="text-purple-600 hover:text-purple-800 font-medium"
                    >
                      {expandedRow === transaction.id ? 'Hide' : 'View'} Details
                    </button>
                  </td>
                </tr>
                {expandedRow === transaction.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={7} className="px-6 py-4">
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-3">Transaction Details</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-500">Transaction ID:</span>
                            <div className="font-mono text-gray-900 break-all">{transaction.transaction_id}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">Type:</span>
                            <div className="text-gray-900 capitalize">{transaction.type}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">Status:</span>
                            <div className="text-gray-900 capitalize">{transaction.status}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">Phone Number:</span>
                            <div className="font-mono text-gray-900">{transaction.phone}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">Amount:</span>
                            <div className="text-gray-900 font-semibold">GH₵{transaction.amount.toFixed(2)}</div>
                          </div>
                          <div>
                            <span className="font-medium text-gray-500">Timestamp:</span>
                            <div className="text-gray-900">{new Date(transaction.created_at).toLocaleString()}</div>
                          </div>
                          {transaction.type === 'vote' && (
                            <>
                              <div>
                                <span className="font-medium text-gray-500">Candidate:</span>
                                <div className="text-gray-900">{transaction.candidate_name}</div>
                              </div>
                              <div>
                                <span className="font-medium text-gray-500">Candidate Code:</span>
                                <div className="text-gray-900">{transaction.candidate_code}</div>
                              </div>
                              <div>
                                <span className="font-medium text-gray-500">Votes Cast:</span>
                                <div className="text-gray-900">{transaction.votes}</div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden">
        <div className="space-y-4 p-4">
          {transactions.map((transaction) => (
            <div key={`mobile-${transaction.type}-${transaction.id}`} className="bg-gray-50 rounded-lg p-4 space-y-3">
              {/* Header Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getTypeBadge(transaction.type)}
                  {getStatusBadge(transaction.status)}
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-gray-900">GH₵{transaction.amount.toFixed(2)}</div>
                  {transaction.votes && (
                    <div className="text-xs text-gray-500">{transaction.votes} votes</div>
                  )}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Phone:</span>
                  <span className="text-sm font-mono text-gray-900">{transaction.phone}</span>
                </div>
                
                {transaction.type === 'vote' && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Candidate:</span>
                      <span className="text-sm text-gray-900 text-right">{transaction.candidate_name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">Code:</span>
                      <span className="text-sm text-gray-900">{transaction.candidate_code}</span>
                    </div>
                  </>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">Date:</span>
                  <div className="text-right">
                    <div className="text-sm text-gray-900">{new Date(transaction.created_at).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">{new Date(transaction.created_at).toLocaleTimeString()}</div>
                  </div>
                </div>
              </div>

              {/* Expand Button */}
              <button
                onClick={() => setExpandedRow(expandedRow === transaction.id ? null : transaction.id)}
                className="w-full text-center text-purple-600 hover:text-purple-800 font-medium text-sm py-2 border-t border-gray-200 mt-3 pt-3"
              >
                {expandedRow === transaction.id ? 'Hide Details' : 'View Details'}
              </button>

              {/* Expanded Details */}
              {expandedRow === transaction.id && (
                <div className="bg-white rounded-lg p-3 border border-gray-200 mt-3 space-y-2">
                  <h4 className="font-medium text-gray-900 text-sm">Transaction Details</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-500">Transaction ID:</span>
                      <div className="font-mono text-gray-900 break-all mt-1">{transaction.transaction_id}</div>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-500">Type:</span>
                      <span className="text-gray-900 capitalize">{transaction.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-500">Status:</span>
                      <span className="text-gray-900 capitalize">{transaction.status}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-500">Timestamp:</span>
                      <div className="text-gray-900 mt-1">{new Date(transaction.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Responsive Enhanced Pagination */}
      <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
            Showing <span className="font-medium">{((pagination.current_page - 1) * pagination.per_page) + 1}</span> to{' '}
            <span className="font-medium">{Math.min(pagination.current_page * pagination.per_page, pagination.total)}</span> of{' '}
            <span className="font-medium">{pagination.total}</span> results
          </div>
          
          <div className="flex items-center justify-center space-x-1">
            {/* Mobile pagination - simplified */}
            <div className="flex sm:hidden items-center space-x-1">
              <button
                onClick={() => onPageChange(pagination.current_page - 1)}
                disabled={pagination.current_page <= 1}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </button>
              
              <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700">
                {pagination.current_page} / {pagination.total_pages}
              </span>
              
              <button
                onClick={() => onPageChange(pagination.current_page + 1)}
                disabled={pagination.current_page >= pagination.total_pages}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Desktop pagination - full */}
            <div className="hidden sm:flex items-center space-x-1">
              <button
                onClick={() => onPageChange(1)}
                disabled={pagination.current_page <= 1}
                className="inline-flex items-center px-2 py-2 border border-gray-300 rounded-l-lg text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
                <ChevronLeft className="h-4 w-4 -ml-1" />
              </button>
              <button
                onClick={() => onPageChange(pagination.current_page - 1)}
                disabled={pagination.current_page <= 1}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>
              
              <span className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 bg-white">
                Page {pagination.current_page} of {pagination.total_pages}
              </span>
              
              <button
                onClick={() => onPageChange(pagination.current_page + 1)}
                disabled={pagination.current_page >= pagination.total_pages}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
              <button
                onClick={() => onPageChange(pagination.total_pages)}
                disabled={pagination.current_page >= pagination.total_pages}
                className="inline-flex items-center px-2 py-2 border border-gray-300 rounded-r-lg text-sm font-medium text-gray-500 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
                <ChevronRight className="h-4 w-4 -ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}