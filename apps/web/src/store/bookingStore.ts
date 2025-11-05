import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface PatientDetails {
  fullName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email?: string;
  relationship: 'self' | 'mother' | 'father' | 'spouse' | 'child' | 'other';
}

export interface CollectionDetails {
  type: 'home' | 'lab';
  date: string;
  timeSlot: 'morning' | 'afternoon' | 'evening';
  address?: string;
  city?: string;
  pincode?: string;
  landmark?: string;
}

export interface Booking {
  id: string;
  items: any[];
  patient: PatientDetails;
  collection: CollectionDetails;
  paymentMethod: 'prepaid' | 'pay_at_lab';
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

interface BookingStore {
  currentBooking: Partial<Booking>;
  bookings: Booking[];
  currentStep: number;
  setPatientDetails: (details: PatientDetails) => void;
  setCollectionDetails: (details: CollectionDetails) => void;
  setPaymentMethod: (method: 'prepaid' | 'pay_at_lab') => void;
  setStep: (step: number) => void;
  confirmBooking: () => string;
  getBookingById: (id: string) => Booking | undefined;
  resetCurrentBooking: () => void;
}

export const useBookingStore = create<BookingStore>()(n  persist(
    (set, get) => ({
      currentBooking: {},
      bookings: [],
      currentStep: 1,

      setPatientDetails: (details) => {
        set((state) => ({
          currentBooking: {
            ...state.currentBooking,
            patient: details,
          },
        }));
      },

      setCollectionDetails: (details) => {
        set((state) => ({
          currentBooking: {
            ...state.currentBooking,
            collection: details,
          },
        }));
      },

      setPaymentMethod: (method) => {
        set((state) => ({
          currentBooking: {
            ...state.currentBooking,
            paymentMethod: method,
          },
        }));
      },

      setStep: (step) => {
        set({ currentStep: step });
      },

      confirmBooking: () => {
        const booking = get().currentBooking;
        const bookingId = `BK${Date.now()}`;
        
        const completeBooking: Booking = {
          id: bookingId,
          items: booking.items || [],
          patient: booking.patient!,
          collection: booking.collection!,
          paymentMethod: booking.paymentMethod || 'pay_at_lab',
          totalAmount: booking.totalAmount || 0,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          bookings: [...state.bookings, completeBooking],
        }));

        return bookingId;
      },

      getBookingById: (id) => {
        return get().bookings.find((b) => b.id === id);
      },

      resetCurrentBooking: () => {
        set({ currentBooking: {}, currentStep: 1 });
      },
    }),
    {
      name: 'lablink-bookings',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
