'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend} from 'recharts'
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';

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

const COLORS = ['#9333ea', '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16'];

export function VoteBarChart({ data }: VoteChartProps) {
  const chartData = data.map(item => ({
    name: `${item.candidate_name}`,
    code: item.candidate_code,
    votes: item.total_votes,
    amount: item.total_amount,
    percentage: parseFloat(item.vote_percentage)
  }));

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{
      value: number;
      payload: {
        amount: number;
        percentage: number;
      };
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 sm:p-4 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          <p className="font-semibold text-gray-900 text-sm sm:text-base">{label}</p>
          <p className="text-purple-600 text-xs sm:text-sm">
            <span className="font-medium">Votes:</span> {payload[0].value.toLocaleString()}
          </p>
          <p className="text-green-600 text-xs sm:text-sm">
            <span className="font-medium">Amount:</span> GH₵{payload[0].payload.amount.toFixed(2)}
          </p>
          <p className="text-blue-600 text-xs sm:text-sm">
            <span className="font-medium">Percentage:</span> {payload[0].payload.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
        <h3 className="text-base sm:text-lg font-semibold flex items-center">
          <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-purple-600" />
          Vote Distribution
        </h3>
        <div className="flex items-center text-xs sm:text-sm text-gray-500">
          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
          Total: {chartData.reduce((sum, item) => sum + item.votes, 0).toLocaleString()} votes
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300} className="sm:!h-[350px]">
        <BarChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={80}
            fontSize={10}
            tick={{ fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
            className="sm:text-xs"
          />
          <YAxis 
            tick={{ fill: '#6b7280', fontSize: 10 }}
            axisLine={{ stroke: '#e5e7eb' }}
            className="sm:text-xs"
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="votes" 
            fill="#9333ea" 
            radius={[4, 4, 0, 0]}
            stroke="#7c3aed"
            strokeWidth={1}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function VotePieChart({ data }: VoteChartProps) {
  const pieData = data.map((item, index) => ({
    name: item.candidate_name,
    code: item.candidate_code,
    value: item.total_votes,
    percentage: parseFloat(item.vote_percentage),
    color: COLORS[index % COLORS.length],
    amount: item.total_amount
  }));

  const CustomPieTooltip = ({ active, payload }: {
    active?: boolean;
    payload?: Array<{
      payload: {
        name: string;
        code: string;
        value: number;
        percentage: number;
        amount: number;
      };
    }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 sm:p-4 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          <p className="font-semibold text-gray-900 text-sm sm:text-base">{data.name}</p>
          <p className="text-xs sm:text-sm text-gray-600">Code: {data.code}</p>
          <p className="text-purple-600 text-xs sm:text-sm">
            <span className="font-medium">Votes:</span> {data.value.toLocaleString()} ({data.percentage}%)
          </p>
          <p className="text-green-600 text-xs sm:text-sm">
            <span className="font-medium">Amount:</span> GH₵{data.amount.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
  }) => {
    if (percent < 0.05) return null; // Don't show labels for slices smaller than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={10}
        fontWeight="bold"
        className="sm:text-xs"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
        <h3 className="text-base sm:text-lg font-semibold flex items-center">
          <PieChartIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
          Vote Percentage
        </h3>
        <div className="text-xs sm:text-sm text-gray-500">
          {pieData.length} candidates
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300} className="sm:!h-[350px]">
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            stroke="#ffffff"
            strokeWidth={2}
            className="sm:!r-[120px]"
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomPieTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            wrapperStyle={{ fontSize: '12px' }}
            formatter={(value, entry) => {
              const typedEntry = entry as { color?: string; payload?: { code: string } };
              return (
                <span style={{ color: typedEntry.color || '#000000', fontWeight: 500 }} className="text-xs sm:text-sm">
                  {value} ({typedEntry.payload?.code || ''})
                </span>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}