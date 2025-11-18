import { createRazorpayOrder, initiateRazorpayCheckout } from '@/lib/payments/razorpay';
import { initiatePhonePePayment } from '@/lib/payments/phonepe';
import { supabase } from '@/lib/supabase/client';

jest.mock('@/lib/supabase/client');

describe('Payment Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Razorpay Integration', () => {
    it('should create Razorpay order', async () => {
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: {
          orderId: 'order_test123',
          amount: 50000,
          currency: 'INR',
        },
        error: null,
      });

      const order = await createRazorpayOrder(
        500,
        'BK123',
        {
          name: 'Test User',
          email: 'test@example.com',
          phone: '9876543210',
        }
      );

      expect(order).toBeDefined();
      expect(order.orderId).toBe('order_test123');
      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'razorpay-create-order',
        expect.objectContaining({
          body: expect.objectContaining({
            amount: 500,
            bookingId: 'BK123',
          }),
        })
      );
    });

    it('should handle Razorpay order creation failure', async () => {
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Razorpay not configured' },
      });

      await expect(
        createRazorpayOrder(500, 'BK123', {
          name: 'Test',
          email: 'test@example.com',
          phone: '9876543210',
        })
      ).rejects.toThrow();
    });
  });

  describe('PhonePe Integration', () => {
    it('should initiate PhonePe payment', async () => {
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: {
          paymentUrl: 'https://mercury-uat.phonepe.com/transact/pg?token=test',
          merchantTransactionId: 'TXN123',
        },
        error: null,
      });

      const result = await initiatePhonePePayment(
        500,
        'BK123',
        {
          name: 'Test User',
          phone: '9876543210',
        }
      );

      expect(result).toBeDefined();
      expect(result.paymentUrl).toContain('phonepe.com');
      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'phonepe-initiate',
        expect.objectContaining({
          body: expect.objectContaining({
            amount: 500,
            bookingId: 'BK123',
          }),
        })
      );
    });

    it('should handle PhonePe payment initiation failure', async () => {
      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'PhonePe not configured' },
      });

      await expect(
        initiatePhonePePayment(500, 'BK123', {
          name: 'Test',
          phone: '9876543210',
        })
      ).rejects.toThrow();
    });
  });
});

