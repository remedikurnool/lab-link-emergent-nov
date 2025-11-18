import { createBooking } from '@/lib/supabase-functions';
import { supabase } from '@/lib/supabase/client';

jest.mock('@/lib/supabase/client');

describe('Booking Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create booking with valid data', async () => {
    const mockUser = { id: 'user-123' };
    const mockPartner = { id: 'partner-123', commission_percentage: 10 };
    const mockPatient = { id: 'patient-123' };

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    (supabase.from as jest.Mock).mockImplementation((table) => {
      if (table === 'partners') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: mockPartner,
            error: null,
          }),
        };
      }
      if (table === 'patients') {
        return {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: mockPatient,
            error: null,
          }),
        };
      }
      if (table === 'bookings') {
        return {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: 'BK123', status: 'pending' },
            error: null,
          }),
        };
      }
      if (table === 'commissions') {
        return {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: 'comm-123', amount: 50 },
            error: null,
          }),
        };
      }
      return {
        select: jest.fn(),
        insert: jest.fn(),
        update: jest.fn(),
      };
    });

    const result = await createBooking(
      {
        fullName: 'Test Patient',
        age: 25,
        gender: 'male',
        phone: '9876543210',
        email: 'test@example.com',
        relationship: 'self',
      },
      {
        type: 'home',
        date: '2024-01-01',
        timeSlot: '10:00 AM - 12:00 PM',
        address: '123 Test St',
        city: 'Test City',
        pincode: '123456',
      },
      [
        {
          id: 'test-1',
          type: 'test',
          name: 'Blood Test',
          price: 500,
          diagnosticCenterId: 'dc-1',
          diagnosticCenterName: 'Lab 1',
        },
      ],
      500,
      'pay_at_lab'
    );

    expect(result.bookingId).toBeDefined();
  });

  it('should handle booking creation errors', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: null,
    });

    await expect(
      createBooking(
        {
          fullName: 'Test',
          age: 25,
          gender: 'male',
          phone: '9876543210',
          relationship: 'self',
        },
        {
          type: 'home',
          date: '2024-01-01',
          timeSlot: '10:00 AM',
        },
        [],
        0,
        'pay_at_lab'
      )
    ).rejects.toThrow();
  });
});

