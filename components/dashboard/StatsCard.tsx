'use client';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

export function StatsCard({ title, value, subtitle, icon, trend }: StatsCardProps) {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate">{title}</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 break-words">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-500 mb-2 break-words leading-tight">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center text-xs sm:text-sm font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <span className="mr-1">
                {trend.isPositive ? '↗️' : '↘️'}
              </span>
              <span>{trend.value}</span>
              <span className="text-gray-400 ml-1 hidden sm:inline">vs last hour</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-purple-600 opacity-80 bg-purple-50 p-2 sm:p-3 rounded-lg ml-2 flex-shrink-0">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}