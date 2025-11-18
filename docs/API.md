# Lab Link - API Documentation

## Overview

Lab Link uses Supabase as the backend, providing REST APIs and real-time subscriptions. This document covers the main API endpoints and functions.

## Base URL

- **Staging**: `https://your-project.supabase.co`
- **Production**: `https://your-project.supabase.co`

## Authentication

All API requests require authentication via JWT tokens. Include the token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

## Supabase Edge Functions

### Payment Functions

#### Create Razorpay Order
- **Endpoint**: `/functions/v1/razorpay-create-order`
- **Method**: POST
- **Body**:
  ```json
  {
    "amount": 500,
    "bookingId": "BK123",
    "userDetails": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210"
    }
  }
  ```
- **Response**:
  ```json
  {
    "orderId": "order_xxx",
    "amount": 500,
    "currency": "INR"
  }
  ```

#### Verify Razorpay Payment
- **Endpoint**: `/functions/v1/razorpay-verify-payment`
- **Method**: POST
- **Body**:
  ```json
  {
    "paymentResponse": {...},
    "orderId": "order_xxx"
  }
  ```

#### Initiate PhonePe Payment
- **Endpoint**: `/functions/v1/phonepe-initiate`
- **Method**: POST
- **Body**:
  ```json
  {
    "amount": 500,
    "bookingId": "BK123",
    "userDetails": {
      "name": "John Doe",
      "phone": "9876543210"
    }
  }
  ```

### Notification Functions

#### Send WhatsApp
- **Endpoint**: `/functions/v1/whatsapp-send`
- **Method**: POST
- **Body**:
  ```json
  {
    "to": "+919876543210",
    "templateName": "booking_confirmation",
    "params": {
      "bookingId": "BK123",
      "amount": "₹500"
    }
  }
  ```

#### Send SMS
- **Endpoint**: `/functions/v1/sms-send`
- **Method**: POST
- **Body**:
  ```json
  {
    "to": "+919876543210",
    "message": "Your booking is confirmed"
  }
  ```

#### Send Email
- **Endpoint**: `/functions/v1/email-send`
- **Method**: POST
- **Body**:
  ```json
  {
    "to": "user@example.com",
    "subject": "Booking Confirmation",
    "html": "<h1>Your booking is confirmed</h1>"
  }
  ```

## Database Tables

### Bookings

**Table**: `bookings`

**Columns**:
- `id` (TEXT) - Booking ID
- `partner_id` (UUID) - Partner reference
- `patient_id` (UUID) - Patient reference
- `items` (JSONB) - Booking items
- `total_amount` (DECIMAL) - Total amount
- `status` (TEXT) - Booking status
- `payment_status` (TEXT) - Payment status
- `payment_gateway` (TEXT) - Payment gateway used

**RLS Policies**:
- Partners can view their own bookings
- Partners can create bookings
- Admins can view all bookings

### Commissions

**Table**: `commissions`

**Columns**:
- `id` (UUID) - Commission ID
- `partner_id` (UUID) - Partner reference
- `booking_id` (TEXT) - Booking reference
- `amount` (DECIMAL) - Commission amount
- `status` (TEXT) - Commission status

### Partners

**Table**: `partners`

**Columns**:
- `id` (UUID) - Partner ID
- `user_id` (UUID) - Auth user reference
- `name` (TEXT) - Partner name
- `commission_percentage` (DECIMAL) - Commission rate
- `notification_preferences` (JSONB) - Notification settings

## Database Functions

### Check Slot Availability
```sql
SELECT public.check_slot_availability(
  centre_id,
  '2024-01-01'::DATE,
  '10:00'::TIME,
  '12:00'::TIME
);
```

### Reserve Slot
```sql
SELECT public.reserve_slot(
  centre_id,
  '2024-01-01'::DATE,
  '10:00'::TIME,
  '12:00'::TIME
);
```

### Create Notification
```sql
SELECT public.create_notification(
  user_id,
  partner_id,
  'booking',
  'Title',
  'Message',
  '{"key": "value"}'::jsonb
);
```

## Webhooks

### Payment Webhooks

#### Razorpay Webhook
- **Endpoint**: `/functions/v1/razorpay-webhook`
- **Method**: POST
- **Headers**: `X-Razorpay-Signature` for verification

#### PhonePe Webhook
- **Endpoint**: `/functions/v1/phonepe-webhook`
- **Method**: POST

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": {}
  }
}
```

### Error Codes

- `AUTH_REQUIRED` - Authentication required
- `VALIDATION_ERROR` - Invalid input
- `NOT_FOUND` - Resource not found
- `PAYMENT_FAILED` - Payment processing failed
- `SERVER_ERROR` - Internal server error

## Rate Limiting

- API requests: 100 requests per minute per user
- Edge Functions: 1000 requests per hour per project

## Support

For API issues:
1. Check error response for details
2. Verify authentication token
3. Review Supabase logs
4. Contact support team

---

**Last Updated**: $(date)

