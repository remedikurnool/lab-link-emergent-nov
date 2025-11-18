'use client';

import { useEffect, useState } from 'react';
import { CreditCard, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

interface PaymentTransaction {
  id: string;
  transaction_id: string;
  payment_gateway: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  gateway_response?: any;
}

interface PaymentHistoryProps {
  bookingId: string;
}

export function PaymentHistory({ bookingId }: PaymentHistoryProps) {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) return;

    const fetchPaymentHistory = async () => {
      try {
        const { data, error } = await supabase
          .from('payment_transactions')
          .select('*')
          .eq('booking_id', bookingId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setTransactions(data || []);
      } catch (error) {
        console.error('Error fetching payment history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [bookingId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'refunded':
        return <RefreshCw className="w-5 h-5 text-orange-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      case 'refunded':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
        <div className="text-center text-gray-500 py-4">Loading...</div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment History
        </h3>
        <div className="text-center text-gray-500 py-4">
          No payment transactions found
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <CreditCard className="w-5 h-5" />
        Payment History
      </h3>
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {getStatusIcon(transaction.status)}
                <div>
                  <div className="font-semibold text-gray-900 capitalize">
                    {transaction.payment_gateway}
                  </div>
                  <div className="text-sm text-gray-500 font-mono">
                    {transaction.transaction_id}
                  </div>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                  transaction.status
                )}`}
              >
                {transaction.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Amount:</span>
                <span className="ml-2 font-semibold text-gray-900">
                  ₹{transaction.amount.toFixed(2)} {transaction.currency}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Date:</span>
                <span className="ml-2 text-gray-900">
                  {new Date(transaction.created_at).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {transaction.gateway_response && (
              <details className="mt-3">
                <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-900">
                  View Details
                </summary>
                <pre className="mt-2 p-3 bg-gray-50 rounded text-xs overflow-auto max-h-40">
                  {JSON.stringify(transaction.gateway_response, null, 2)}
                </pre>
              </details>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

