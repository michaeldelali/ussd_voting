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
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 overflow-hidden">
          <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1 truncate" title={title}>
            {title}
          </p>
          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 overflow-hidden" title={typeof value === 'number' ? value.toLocaleString() : value.toString()}>
            <span className="block truncate">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-500 mb-2 leading-tight overflow-hidden max-h-10" title={subtitle}>
              <span className="block truncate">{subtitle}</span>
            </p>
          )}
          {trend && (
            <div className={`flex items-center text-xs sm:text-sm font-medium overflow-hidden ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              <span className="mr-1 flex-shrink-0">
                {trend.isPositive ? '↗️' : '↘️'}
              </span>
              <span className="truncate">{trend.value}</span>
              <span className="text-gray-400 ml-1 hidden sm:inline flex-shrink-0">vs last hour</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-purple-600 opacity-80 bg-purple-50 p-2 sm:p-3 rounded-lg flex-shrink-0">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}