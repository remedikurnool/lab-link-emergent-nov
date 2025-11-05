// Auth Types

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'partner';
  created_at: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  partner_type: string;
}
