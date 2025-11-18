'use client';

import { useState, useEffect } from 'react';
import { Clock, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  current_bookings: number;
  max_bookings: number;
}

interface TimeSlotPickerProps {
  centreId: string;
  date: string;
  selectedSlot?: string;
  onSelect: (slot: { start: string; end: string; slotId: string }) => void;
  disabled?: boolean;
}

export function TimeSlotPicker({
  centreId,
  date,
  selectedSlot,
  onSelect,
  disabled = false,
}: TimeSlotPickerProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!centreId || !date) return;

    const fetchSlots = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('time_slots')
          .select('*')
          .eq('diagnostic_centre_id', centreId)
          .eq('date', date)
          .eq('is_available', true)
          .order('start_time');

        if (fetchError) throw fetchError;

        setSlots(data || []);
      } catch (err: any) {
        console.error('Error fetching slots:', err);
        setError('Failed to load time slots');
        // Fallback to default slots if API fails
        setSlots(getDefaultSlots());
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [centreId, date]);

  const getDefaultSlots = (): TimeSlot[] => {
    // Default time slots if API fails
    const defaultTimes = [
      { start: '09:00', end: '11:00' },
      { start: '11:00', end: '13:00' },
      { start: '13:00', end: '15:00' },
      { start: '15:00', end: '17:00' },
      { start: '17:00', end: '19:00' },
    ];

    return defaultTimes.map((time, index) => ({
      id: `default-${index}`,
      start_time: time.start,
      end_time: time.end,
      is_available: true,
      current_bookings: 0,
      max_bookings: 5,
    }));
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isSlotSelected = (slot: TimeSlot) => {
    if (!selectedSlot) return false;
    return selectedSlot === `${slot.start_time}-${slot.end_time}`;
  };

  const handleSlotClick = (slot: TimeSlot) => {
    if (disabled || !slot.is_available) return;

    onSelect({
      start: slot.start_time,
      end: slot.end_time,
      slotId: slot.id,
    });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Clock className="w-4 h-4" />
          Loading available slots...
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-12 bg-gray-200 animate-pulse rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error && slots.length === 0) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-red-600">{error}</div>
        <div className="text-sm text-gray-600">
          Using default time slots. Please contact support if this persists.
        </div>
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Clock className="w-4 h-4" />
          Available Time Slots
        </div>
        <div className="text-sm text-gray-600">
          No slots available for this date. Please select another date.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <Clock className="w-4 h-4" />
        Available Time Slots
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {slots.map((slot) => {
          const selected = isSlotSelected(slot);
          const isFull = slot.current_bookings >= slot.max_bookings;
          const isDisabled = disabled || !slot.is_available || isFull;

          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => handleSlotClick(slot)}
              disabled={isDisabled}
              className={`
                relative flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all
                ${
                  selected
                    ? 'border-primary-600 bg-primary-50 text-primary-900'
                    : 'border-gray-200 bg-white text-gray-900 hover:border-primary-300 hover:bg-primary-50'
                }
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {selected && (
                <Check className="absolute top-1 right-1 w-4 h-4 text-primary-600" />
              )}
              <div className="text-sm font-medium">
                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
              </div>
              {!isFull && (
                <div className="text-xs text-gray-500 mt-1">
                  {slot.max_bookings - slot.current_bookings} available
                </div>
              )}
              {isFull && (
                <div className="text-xs text-red-600 mt-1">Full</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

