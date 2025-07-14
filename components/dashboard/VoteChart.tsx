'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

interface VoteData {
  candidate_name: string;
  candidate_code: string;
  total_votes: number;
  vote_percentage: string;
  total_amount: number;
}

interface VoteChartProps {
  data: VoteData[];
}

const COLORS = ['#9333ea', '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

export function VoteBarChart({ data }: VoteChartProps) {
  const chartData = data.map(item => ({
    name: `${item.candidate_name} (${item.candidate_code})`,
    votes: item.total_votes,
    amount: item.total_amount
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Vote Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={80}
            fontSize={12}
          />
          <YAxis />
          <Tooltip 
            formatter={(value, name) => [
              typeof value === 'number' ? value.toLocaleString() : value,
              name === 'votes' ? 'Votes' : 'Amount (GH₵)'
            ]}
          />
          <Bar dataKey="votes" fill="#9333ea" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function VotePieChart({ data }: VoteChartProps) {
  const pieData = data.map((item, index) => ({
    name: `${item.candidate_name} (${item.candidate_code})`,
    value: item.total_votes,
    percentage: item.vote_percentage,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Vote Percentage</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percentage }) => `${name}: ${percentage}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => [value.toLocaleString(), 'Votes']}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}