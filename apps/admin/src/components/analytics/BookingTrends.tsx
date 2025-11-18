'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface BookingTrendsProps {
  data: Array<{
    date: string;
    confirmed: number;
    completed: number;
    cancelled: number;
  }>;
}

export function BookingTrends({ data }: BookingTrendsProps) {
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
    }),
    confirmed: item.confirmed,
    completed: item.completed,
    cancelled: item.cancelled,
  }));

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Booking Trends
        </h3>
        <p className="text-sm text-gray-600">
          Booking status distribution over time
        </p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorConfirmed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorCancelled" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Area
            type="monotone"
            dataKey="confirmed"
            stackId="1"
            stroke="#3b82f6"
            fill="url(#colorConfirmed)"
            name="Confirmed"
          />
          <Area
            type="monotone"
            dataKey="completed"
            stackId="1"
            stroke="#10b981"
            fill="url(#colorCompleted)"
            name="Completed"
          />
          <Area
            type="monotone"
            dataKey="cancelled"
            stackId="1"
            stroke="#ef4444"
            fill="url(#colorCancelled)"
            name="Cancelled"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

