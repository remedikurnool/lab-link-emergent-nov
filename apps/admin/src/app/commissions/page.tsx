'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');

  useEffect(() => {
    fetchCommissions();
  }, [statusFilter]);

  const fetchCommissions = async () => {
    try {
      let query = supabase
        .from('commissions')
        .select(`
          *,
          partners(full_name, phone),
          bookings(id, total_amount)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setCommissions(data || []);
    } catch (error) {
      console.error('Error fetching commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveCommission = async (commissionId: string) => {
    try {
      const { error } = await supabase
        .from('commissions')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', commissionId);

      if (error) throw error;
      fetchCommissions();
    } catch (error) {
      console.error('Error approving commission:', error);
    }
  };

  const markAsPaid = async (commissionId: string) => {
    try {
      const { error } = await supabase
        .from('commissions')
        .update({ 
          status: 'paid',
          paid_at: new Date().toISOString()
        })
        .eq('id', commissionId);

      if (error) throw error;
      fetchCommissions();
    } catch (error) {
      console.error('Error marking as paid:', error);
    }
  };

  const totalPending = commissions
    .filter(c => c.status === 'pending')
    .reduce((sum, c) => sum + parseFloat(c.amount), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Commissions Management</h1>
              <p className="text-sm text-gray-600">Approve and manage partner commissions</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="text-sm font-medium text-gray-600">Pending</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalPending)}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Commissions</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="space-y-4">
            {commissions.map((commission) => (
              <div
                key={commission.id}
                className="bg-white rounded-xl p-6 border border-gray-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 mb-2">
                      {commission.partners?.full_name || 'Unknown Partner'}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div>Booking: {commission.booking_id}</div>
                      <div>Amount: {formatCurrency(parseFloat(commission.amount))}</div>
                      <div>Date: {formatDate(commission.created_at)}</div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      commission.status === 'paid' ? 'bg-green-100 text-green-700' :
                      commission.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {commission.status.toUpperCase()}
                    </span>
                    {commission.status === 'pending' && (
                      <button
                        onClick={() => approveCommission(commission.id)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg text-sm"
                      >
                        Approve
                      </button>
                    )}
                    {commission.status === 'approved' && (
                      <button
                        onClick={() => markAsPaid(commission.id)}
                        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg text-sm"
                      >
                        Mark as Paid
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
