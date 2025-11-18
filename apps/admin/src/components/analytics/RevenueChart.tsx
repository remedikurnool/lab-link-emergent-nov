'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface RevenueChartProps {
  data: Array<{
    date: string;
    revenue: number;
    bookings: number;
  }>;
  period: '7d' | '30d' | '90d' | '1y';
}

export function RevenueChart({ data, period }: RevenueChartProps) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      date: new Date(item.date).toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
      }),
      revenue: item.revenue,
      bookings: item.bookings,
    }));
  }, [data]);

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Revenue Trends
        </h3>
        <p className="text-sm text-gray-600">
          Revenue and booking trends over time
        </p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            formatter={(value: number, name: string) => {
              if (name === 'revenue') {
                return [formatCurrency(value), 'Revenue'];
              }
              return [value, 'Bookings'];
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 4 }}
            name="Revenue"
          />
          <Line
            type="monotone"
            dataKey="bookings"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            name="Bookings"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

