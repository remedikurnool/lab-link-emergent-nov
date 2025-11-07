-- Create Supabase Storage Buckets and Settings Table

-- Settings table for admin-configurable integrations
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO public.settings (key, value) VALUES
  ('whatsapp_config', '{
    "enabled": false,
    "business_phone": "",
    "api_key": "",
    "template_id": ""
  }'),
  ('razorpay_config', '{
    "enabled": false,
    "key_id": "",
    "key_secret": ""
  }'),
  ('phonepe_config', '{
    "enabled": false,
    "merchant_id": "",
    "salt_key": "",
    "salt_index": "1"
  }')
ON CONFLICT (key) DO NOTHING;

-- RLS for settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Public can read settings
CREATE POLICY "Public read settings" ON public.settings
  FOR SELECT USING (true);

-- Only authenticated users can update (admin check in app)
CREATE POLICY "Authenticated update settings" ON public.settings
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Create storage buckets (Run these in Supabase Dashboard -> Storage)
-- Bucket 1: prescriptions
-- Bucket 2: reports

-- RLS policies for storage will be set via Supabase Dashboard
