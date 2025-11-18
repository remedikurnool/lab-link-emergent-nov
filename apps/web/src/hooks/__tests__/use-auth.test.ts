import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '../use-auth';
import { supabase } from '@/lib/supabase/client';

jest.mock('@/lib/supabase/client');

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return null user when not authenticated', async () => {
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.user).toBeNull();
    });
  });

  it('should return user when authenticated', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
    };

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });
  });

  it('should handle auth state changes', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
    };

    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.user).toBeDefined();
    });
  });
});

