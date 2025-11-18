'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface PartnerMetricsProps {
  data: Array<{
    partnerName: string;
    bookings: number;
    revenue: number;
    commissions: number;
  }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function PartnerMetrics({ data }: PartnerMetricsProps) {
  const chartData = data.map((item) => ({
    name: item.partnerName.length > 15 
      ? item.partnerName.substring(0, 15) + '...' 
      : item.partnerName,
    fullName: item.partnerName,
    bookings: item.bookings,
    revenue: item.revenue,
    commissions: item.commissions,
  }));

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Partner Performance
        </h3>
        <p className="text-sm text-gray-600">
          Top partners by bookings and revenue
        </p>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
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
              if (name === 'revenue' || name === 'commissions') {
                return [formatCurrency(value), name === 'revenue' ? 'Revenue' : 'Commissions'];
              }
              return [value, 'Bookings'];
            }}
          />
          <Legend />
          <Bar dataKey="revenue" name="Revenue" fill="#10b981" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
          <Bar dataKey="commissions" name="Commissions" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

