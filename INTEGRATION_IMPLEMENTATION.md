# Lab Link - Integration Implementation Guide

## Overview
This document describes the implementation of payment gateways (Razorpay, PhonePe) and notification services (WhatsApp, SMS, Email) with admin-configurable credentials.

## Database Migrations

### Migration 004: Payment Tracking
- **File**: `supabase/migrations/004_payment_tracking.sql`
- **Changes**:
  - Adds payment columns to `bookings` table (payment_id, payment_status, payment_gateway, payment_timestamp, payment_response)
  - Creates `payment_transactions` table for audit trail
  - Adds indexes for performance

### Migration 005: Notification Settings
- **File**: `supabase/migrations/005_notification_settings.sql`
- **Changes**:
  - Adds SMS and Email configurations to `settings` table
  - Adds `notification_preferences` column to `partners` table
  - Creates `notification_history` table for tracking all notifications

## Payment Services

### Razorpay Integration
- **Client Service**: `apps/web/src/lib/payments/razorpay.ts`
- **Edge Functions**:
  - `supabase/functions/razorpay-create-order/index.ts` - Creates Razorpay order
  - `supabase/functions/razorpay-verify-payment/index.ts` - Verifies payment signature

**Usage**:
```typescript
import { createRazorpayOrder, initiateRazorpayCheckout, verifyRazorpayPayment } from '@/lib/payments/razorpay';

// Create order
const order = await createRazorpayOrder(amount, bookingId, userDetails);

// Open checkout
const paymentResponse = await initiateRazorpayCheckout(order, userDetails, bookingId);

// Verify payment
const verified = await verifyRazorpayPayment(paymentResponse, order.id);
```

### PhonePe Integration
- **Client Service**: `apps/web/src/lib/payments/phonepe.ts`
- **Edge Functions**:
  - `supabase/functions/phonepe-initiate/index.ts` - Initiates PhonePe payment
  - `supabase/functions/phonepe-status/index.ts` - Checks payment status

**Usage**:
```typescript
import { initiatePhonePePayment, verifyPhonePePayment } from '@/lib/payments/phonepe';

// Initiate payment (redirects to PhonePe)
const paymentUrl = await initiatePhonePePayment(amount, bookingId, userDetails);

// Verify payment status
const status = await verifyPhonePePayment(merchantTransactionId);
```

## Notification Services

### WhatsApp Notifications
- **Client Service**: `apps/web/src/lib/notifications/whatsapp.ts`
- **Edge Function**: `supabase/functions/whatsapp-send/index.ts`
- **Supported Providers**: Twilio, Meta Cloud API

**Usage**:
```typescript
import { sendWhatsAppNotification } from '@/lib/notifications/whatsapp';

await sendWhatsAppNotification(
  '+919876543210',
  'booking_confirmation',
  { bookingId: 'BK123', amount: '500' }
);
```

### SMS Notifications
- **Client Service**: `apps/web/src/lib/notifications/sms.ts`
- **Edge Function**: `supabase/functions/sms-send/index.ts`
- **Supported Providers**: Twilio, MSG91

**Usage**:
```typescript
import { sendSMSNotification } from '@/lib/notifications/sms';

await sendSMSNotification(
  '+919876543210',
  'Your booking BK123 is confirmed. Amount: ₹500'
);
```

### Email Notifications
- **Client Service**: `apps/web/src/lib/notifications/email.ts`
- **Edge Function**: `supabase/functions/email-send/index.ts`
- **Supported Providers**: Resend, SendGrid

**Usage**:
```typescript
import { sendEmailNotification } from '@/lib/notifications/email';

await sendEmailNotification({
  to: 'user@example.com',
  subject: 'Booking Confirmation',
  html: '<h1>Your booking is confirmed</h1>',
  text: 'Your booking is confirmed'
});
```

## Admin Settings Configuration

### Settings Page
- **File**: `apps/admin/src/app/settings/page.tsx`
- **Features**:
  - Configure Razorpay (Key ID, Key Secret)
  - Configure PhonePe (Merchant ID, Salt Key)
  - Configure WhatsApp (Provider selection: Twilio/Meta, credentials)
  - Configure SMS (Provider selection: Twilio/MSG91, credentials)
  - Configure Email (Provider selection: Resend/SendGrid, credentials)

### Configuration Storage
All configurations are stored in the `settings` table with the following keys:
- `razorpay_config`
- `phonepe_config`
- `whatsapp_config`
- `sms_config`
- `email_config`

## Integration Steps

### 1. Run Database Migrations
```sql
-- Run in Supabase SQL Editor
-- Copy and paste contents of:
-- supabase/migrations/004_payment_tracking.sql
-- supabase/migrations/005_notification_settings.sql
```

### 2. Deploy Edge Functions
```bash
# Deploy all functions to Supabase
supabase functions deploy razorpay-create-order
supabase functions deploy razorpay-verify-payment
supabase functions deploy phonepe-initiate
supabase functions deploy phonepe-status
supabase functions deploy whatsapp-send
supabase functions deploy sms-send
supabase functions deploy email-send
```

### 3. Configure Credentials in Admin Panel
1. Access admin panel: `http://localhost:3201/settings`
2. Enter credentials for each service:
   - **Razorpay**: Key ID and Key Secret from Razorpay dashboard
   - **PhonePe**: Merchant ID and Salt Key from PhonePe dashboard
   - **WhatsApp**: Select provider and enter credentials
   - **SMS**: Select provider (Twilio/MSG91) and enter credentials
   - **Email**: Select provider (Resend/SendGrid) and enter credentials
3. Enable each service by checking the "Enable" checkbox
4. Click "Save" for each configuration

### 4. Update Checkout Flow
The checkout flow needs to be updated to:
1. Show payment method selection (Razorpay, PhonePe, Pay at Lab)
2. Handle payment initiation based on selected method
3. Process payment verification
4. Send notifications after successful booking

## Testing

### Payment Testing
1. **Razorpay Test Mode**:
   - Use test credentials from Razorpay dashboard
   - Test card: 4111 1111 1111 1111
   - CVV: Any 3 digits
   - Expiry: Any future date

2. **PhonePe Test Mode**:
   - Use sandbox credentials
   - Test with small amounts

### Notification Testing
1. **WhatsApp**: Send test message to your WhatsApp number
2. **SMS**: Send test SMS to your phone number
3. **Email**: Send test email to your email address

## Security Considerations

1. **Credentials Storage**: All credentials are stored encrypted in Supabase settings table
2. **API Keys**: Never expose API keys in client-side code
3. **Webhooks**: Implement webhook signature verification for payment gateways
4. **Rate Limiting**: Add rate limiting to prevent abuse

## Next Steps

1. Update checkout flow to integrate payment gateways
2. Add notification triggers to booking creation
3. Implement webhook handlers for payment callbacks
4. Add error handling and retry logic
5. Add notification preferences UI for partners

## Support

For issues or questions:
- Check Edge Function logs in Supabase dashboard
- Verify credentials are correctly configured
- Test each service individually before integration

