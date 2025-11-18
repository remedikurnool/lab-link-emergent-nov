import { sendWhatsAppNotification } from '../whatsapp';
import { supabase } from '@/lib/supabase/client';
import { retry } from '@/lib/utils/retry';

jest.mock('@/lib/supabase/client');
jest.mock('@/lib/utils/retry');

describe('WhatsApp Notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send WhatsApp notification successfully', async () => {
    const mockRetry = retry as jest.MockedFunction<typeof retry>;
    mockRetry.mockResolvedValue({
      data: {
        success: true,
        messageId: 'msg-123',
      },
      error: null,
    });

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          value: {
            enabled: true,
            provider: 'twilio',
            api_key: 'test-key',
            account_sid: 'test-sid',
            auth_token: 'test-token',
          },
        },
        error: null,
      }),
    });

    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'settings') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: {
              value: {
                enabled: true,
                provider: 'twilio',
                api_key: 'test-key',
                account_sid: 'test-sid',
                auth_token: 'test-token',
              },
            },
            error: null,
          }),
        };
      }
      if (table === 'notification_history') {
        return {
          insert: jest.fn().mockResolvedValue({ error: null }),
        };
      }
      return {};
    });

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'user-123' } },
      error: null,
    });

    const result = await sendWhatsAppNotification(
      '+919876543210',
      'booking_confirmation',
      { bookingId: 'BK123', amount: '₹500' }
    );

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('msg-123');
  });

  it('should return error when WhatsApp is not configured', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Not found' },
      }),
    });

    const result = await sendWhatsAppNotification(
      '+919876543210',
      'booking_confirmation',
      { bookingId: 'BK123' }
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('not configured');
  });

  it('should return error when WhatsApp is disabled', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          value: {
            enabled: false,
          },
        },
        error: null,
      }),
    });

    const result = await sendWhatsAppNotification(
      '+919876543210',
      'booking_confirmation',
      { bookingId: 'BK123' }
    );

    expect(result.success).toBe(false);
    expect(result.error).toContain('disabled');
  });

  it('should handle retry on network errors', async () => {
    const mockRetry = retry as jest.MockedFunction<typeof retry>;
    mockRetry.mockRejectedValue(new Error('Network error'));

    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: {
          value: {
            enabled: true,
            provider: 'twilio',
          },
        },
        error: null,
      }),
    });

    const result = await sendWhatsAppNotification(
      '+919876543210',
      'booking_confirmation',
      { bookingId: 'BK123' }
    );

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

