'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Building2,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Package,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activePartners: 0,
    pendingBookings: 0,
    pendingCommissions: 0,
    totalBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch stats
      const [bookingsRes, partnersRes, commissionsRes] = await Promise.all([
        supabase.from('bookings').select('total_amount, status'),
        supabase.from('partners').select('id, is_active'),
        supabase.from('commissions').select('amount, status'),
      ]);

      const totalRevenue = bookingsRes.data?.reduce(
        (sum, b) => sum + parseFloat(b.total_amount || 0),
        0
      ) || 0;

      const activePartners = partnersRes.data?.filter(p => p.is_active).length || 0;
      const pendingBookings = bookingsRes.data?.filter(b => b.status === 'pending').length || 0;
      const pendingCommissions = commissionsRes.data?.filter(c => c.status === 'pending').length || 0;

      setStats({
        totalRevenue,
        activePartners,
        pendingBookings,
        pendingCommissions,
        totalBookings: bookingsRes.data?.length || 0,
      });

      // Fetch recent bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentBookings(bookings || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Lab Link Admin</h1>
                <p className="text-xs text-gray-600">Management Portal</p>
              </div>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/" className="text-sm font-medium text-gray-700 hover:text-primary-600">
                Dashboard
              </Link>
              <Link href="/partners" className="text-sm font-medium text-gray-700 hover:text-primary-600">
                Partners
              </Link>
              <Link href="/bookings" className="text-sm font-medium text-gray-700 hover:text-primary-600">
                Bookings
              </Link>
              <Link href="/commissions" className="text-sm font-medium text-gray-700 hover:text-primary-600">
                Commissions
              </Link>
              <Link href="/centres" className="text-sm font-medium text-gray-700 hover:text-primary-600">
                Centres
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-600">Overview of Lab Link platform</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Revenue */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {formatCurrency(stats.totalRevenue)}
                </div>
                <div className="text-sm text-gray-600">Total Revenue</div>
              </div>

              {/* Active Partners */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stats.activePartners}
                </div>
                <div className="text-sm text-gray-600">Active Partners</div>
              </div>

              {/* Pending Bookings */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stats.pendingBookings}
                </div>
                <div className="text-sm text-gray-600">Pending Bookings</div>
              </div>

              {/* Pending Commissions */}
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {stats.pendingCommissions}
                </div>
                <div className="text-sm text-gray-600">Pending Commissions</div>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900">Recent Bookings</h3>
                  <Link
                    href="/bookings"
                    className="text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    View All
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-gray-200">
                {recentBookings.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No bookings yet
                  </div>
                ) : (
                  recentBookings.map((booking) => (
                    <div key={booking.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900 mb-1">
                            {booking.id}
                          </div>
                          <div className="text-sm text-gray-600">
                            {booking.items?.length || 0} items • {formatCurrency(parseFloat(booking.total_amount))}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDate(booking.created_at)}
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
