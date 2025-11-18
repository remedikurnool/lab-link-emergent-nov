-- Performance Optimization Indexes
-- Add indexes for frequently queried columns

-- Bookings table indexes
CREATE INDEX IF NOT EXISTS idx_bookings_partner_status ON public.bookings(partner_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_date_status ON public.bookings(collection_date, status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings(payment_status) WHERE payment_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at DESC);

-- Commissions table indexes
CREATE INDEX IF NOT EXISTS idx_commissions_partner_status ON public.commissions(partner_id, status);
CREATE INDEX IF NOT EXISTS idx_commissions_status_created ON public.commissions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_commissions_booking_id ON public.commissions(booking_id) WHERE booking_id IS NOT NULL;

-- Partners table indexes
CREATE INDEX IF NOT EXISTS idx_partners_user_id ON public.partners(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_partners_is_active ON public.partners(is_active) WHERE is_active = true;

-- Patients table indexes
CREATE INDEX IF NOT EXISTS idx_patients_partner_id ON public.patients(partner_id);
CREATE INDEX IF NOT EXISTS idx_patients_phone ON public.patients(phone) WHERE phone IS NOT NULL;

-- Centre pricing indexes
CREATE INDEX IF NOT EXISTS idx_centre_pricing_item_type ON public.centre_pricing(item_type, is_active);
CREATE INDEX IF NOT EXISTS idx_centre_pricing_centre_item ON public.centre_pricing(centre_id, item_id, item_type);
CREATE INDEX IF NOT EXISTS idx_centre_pricing_active ON public.centre_pricing(is_active) WHERE is_active = true;

-- Diagnostic centres indexes
CREATE INDEX IF NOT EXISTS idx_diagnostic_centres_city ON public.diagnostic_centres(city) WHERE city IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_diagnostic_centres_active ON public.diagnostic_centres(is_active) WHERE is_active = true;

-- Notification history indexes
CREATE INDEX IF NOT EXISTS idx_notification_history_partner_status ON public.notification_history(partner_id, status);
CREATE INDEX IF NOT EXISTS idx_notification_history_created ON public.notification_history(created_at DESC);

-- Notifications table indexes (from migration 010)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC) WHERE is_read = false;

-- Payment transactions indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_partner ON public.payment_transactions(partner_id, status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_gateway ON public.payment_transactions(payment_gateway, status);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_bookings_partner_date_status ON public.bookings(partner_id, collection_date, status);
CREATE INDEX IF NOT EXISTS idx_commissions_partner_status_date ON public.commissions(partner_id, status, created_at DESC);

-- Analyze tables after index creation
ANALYZE public.bookings;
ANALYZE public.commissions;
ANALYZE public.partners;
ANALYZE public.patients;
ANALYZE public.centre_pricing;
ANALYZE public.diagnostic_centres;
ANALYZE public.notification_history;
ANALYZE public.notifications;
ANALYZE public.payment_transactions;

