'use client';

import { useState } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

interface RefundButtonProps {
  bookingId: string;
  paymentId: string;
  paymentGateway: string;
  amount: number;
  onRefundComplete?: () => void;
}

export function RefundButton({
  bookingId,
  paymentId,
  paymentGateway,
  amount,
  onRefundComplete,
}: RefundButtonProps) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRefund = async () => {
    if (!confirm(`Are you sure you want to refund ₹${amount.toFixed(2)}?`)) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Call refund Edge Function
      const { data, error: refundError } = await supabase.functions.invoke(
        `${paymentGateway}-refund`,
        {
          body: {
            booking_id: bookingId,
            payment_id: paymentId,
            amount: amount,
          },
        }
      );

      if (refundError) throw refundError;

      if (data?.success) {
        // Update booking payment status
        await supabase
          .from('bookings')
          .update({
            payment_status: 'refunded',
            payment_response: {
              ...data,
              refunded_at: new Date().toISOString(),
            },
          })
          .eq('id', bookingId);

        // Update payment transaction
        await supabase
          .from('payment_transactions')
          .update({
            status: 'refunded',
            gateway_response: data,
          })
          .eq('transaction_id', paymentId);

        alert('Refund processed successfully');
        onRefundComplete?.();
      } else {
        throw new Error(data?.error || 'Refund failed');
      }
    } catch (err: any) {
      console.error('Refund error:', err);
      setError(err.message || 'Failed to process refund');
      alert(`Refund failed: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handleRefund}
        disabled={processing}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 text-orange-600 border-orange-300 hover:bg-orange-50"
      >
        <RefreshCw className={`w-4 h-4 ${processing ? 'animate-spin' : ''}`} />
        {processing ? 'Processing...' : 'Refund Payment'}
      </Button>
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

