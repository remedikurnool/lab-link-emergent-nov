// Database Types (will be generated from Supabase schema in later phases)

export interface Partner {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  partner_type:
    | 'pharmacist'
    | 'nurse'
    | 'asha_worker'
    | 'technician'
    | 'medical_representative'
    | 'other';
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Patient {
  id: string;
  partner_id?: string;
  full_name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email?: string;
  address?: string;
  created_at: string;
}

export interface Test {
  id: string;
  name: string;
  description?: string;
  category: 'blood' | 'urine' | 'other';
  price: number;
  partner_commission_percentage: number;
  preparation_instructions?: string;
  report_delivery_time: string;
  is_active: boolean;
  created_at: string;
}

export interface Scan {
  id: string;
  name: string;
  description?: string;
  category: 'xray' | 'ultrasound' | 'ct' | 'mri' | 'other';
  price: number;
  partner_commission_percentage: number;
  preparation_instructions?: string;
  report_delivery_time: string;
  is_active: boolean;
  created_at: string;
}

export interface Package {
  id: string;
  name: string;
  description?: string;
  tests: string[]; // Array of test IDs
  scans?: string[]; // Array of scan IDs
  original_price: number;
  discounted_price: number;
  partner_commission_percentage: number;
  is_active: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  partner_id: string;
  patient_id: string;
  service_type: 'test' | 'scan' | 'package';
  service_id: string;
  booking_date: string;
  time_slot?: string;
  collection_type: 'home' | 'lab';
  collection_address?: string;
  status:
    | 'pending'
    | 'confirmed'
    | 'sample_collected'
    | 'in_progress'
    | 'completed'
    | 'cancelled';
  payment_status: 'pending' | 'completed' | 'refunded';
  payment_method: 'razorpay' | 'phonepe' | 'cash';
  total_amount: number;
  partner_commission: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Commission {
  id: string;
  partner_id: string;
  booking_id: string;
  amount: number;
  status: 'pending' | 'approved' | 'paid';
  created_at: string;
  paid_at?: string;
}

export interface Payout {
  id: string;
  partner_id: string;
  amount: number;
  commission_ids: string[];
  payment_method: string;
  transaction_id?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
}
