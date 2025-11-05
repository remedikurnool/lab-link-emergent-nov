'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export function useBookingsRealtime(partnerId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!partnerId) return;

    const channel = supabase
      .channel('bookings-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `partner_id=eq.${partnerId}`,
        },
        (payload) => {
          console.log('Booking change:', payload);
          queryClient.invalidateQueries({ queryKey: ['partner-bookings'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [partnerId, queryClient]);
}

export function useCommissionsRealtime(partnerId?: string) {
  const queryClient = useQueryClient();
  const [newCommission, setNewCommission] = useState<any>(null);

  useEffect(() => {
    if (!partnerId) return;

    const channel = supabase
      .channel('commissions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'commissions',
          filter: `partner_id=eq.${partnerId}`,
        },
        (payload) => {
          console.log('Commission change:', payload);
          
          if (payload.eventType === 'INSERT') {
            setNewCommission(payload.new);
            showNotification('New Commission Earned!', `₹${payload.new.amount}`);
          }
          
          if (payload.eventType === 'UPDATE' && payload.new.status === 'approved') {
            showNotification('Commission Approved!', `₹${payload.new.amount} ready for payout`);
          }

          queryClient.invalidateQueries({ queryKey: ['partner-commissions'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [partnerId, queryClient]);

  return { newCommission };
}

function showNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/icons/icon-192x192.png',
    });
  }
}

export function useRequestNotificationPermission() {
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      setTimeout(() => {
        Notification.requestPermission();
      }, 3000);
    }
  }, []);
}
