/**
 * Email Notification Templates
 * HTML and text email templates for various notifications
 */

export interface EmailTemplateParams {
  [key: string]: string | number;
}

/**
 * Base email template wrapper
 */
function baseEmailTemplate(
  title: string,
  content: string,
  footer?: string
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">Lab Link</h1>
              <p style="margin: 5px 0 0 0; color: #ffffff; font-size: 14px;">Diagnostic Booking Platform</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              ${content}
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9f9f9; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee;">
              ${footer || `
                <p style="margin: 0; color: #666666; font-size: 12px;">
                  This is an automated email from Lab Link. Please do not reply to this email.
                </p>
                <p style="margin: 10px 0 0 0; color: #999999; font-size: 11px;">
                  © ${new Date().getFullYear()} Lab Link. All rights reserved.
                </p>
              `}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

/**
 * Booking Confirmation Email
 */
export function bookingConfirmationEmail(params: EmailTemplateParams): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Booking Confirmation - ${params.bookingId}`;
  const content = `
    <h2 style="color: #333333; margin-top: 0;">Booking Confirmed! ✅</h2>
    <p style="color: #666666; line-height: 1.6;">
      Dear ${params.patientName || 'Customer'},
    </p>
    <p style="color: #666666; line-height: 1.6;">
      Your booking has been confirmed successfully. Here are the details:
    </p>
    
    <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
      <tr>
        <td style="padding: 10px; background-color: #f9f9f9; border: 1px solid #eeeeee; font-weight: bold; color: #333333;">Booking ID</td>
        <td style="padding: 10px; background-color: #ffffff; border: 1px solid #eeeeee; color: #666666;">${params.bookingId}</td>
      </tr>
      <tr>
        <td style="padding: 10px; background-color: #f9f9f9; border: 1px solid #eeeeee; font-weight: bold; color: #333333;">Amount</td>
        <td style="padding: 10px; background-color: #ffffff; border: 1px solid #eeeeee; color: #666666; font-size: 18px; font-weight: bold; color: #667eea;">${params.amount}</td>
      </tr>
      <tr>
        <td style="padding: 10px; background-color: #f9f9f9; border: 1px solid #eeeeee; font-weight: bold; color: #333333;">Date</td>
        <td style="padding: 10px; background-color: #ffffff; border: 1px solid #eeeeee; color: #666666;">${params.date}</td>
      </tr>
      <tr>
        <td style="padding: 10px; background-color: #f9f9f9; border: 1px solid #eeeeee; font-weight: bold; color: #333333;">Time Slot</td>
        <td style="padding: 10px; background-color: #ffffff; border: 1px solid #eeeeee; color: #666666;">${params.timeSlot}</td>
      </tr>
      <tr>
        <td style="padding: 10px; background-color: #f9f9f9; border: 1px solid #eeeeee; font-weight: bold; color: #333333;">Collection Type</td>
        <td style="padding: 10px; background-color: #ffffff; border: 1px solid #eeeeee; color: #666666;">${params.collectionType === 'home' ? 'Home Collection' : 'Lab Visit'}</td>
      </tr>
    </table>
    
    <p style="color: #666666; line-height: 1.6;">
      Thank you for choosing Lab Link! We'll send you updates about your booking.
    </p>
  `;

  const text = `
Booking Confirmed!

Booking ID: ${params.bookingId}
Amount: ${params.amount}
Date: ${params.date}
Time: ${params.timeSlot}
Collection: ${params.collectionType === 'home' ? 'Home Collection' : 'Lab Visit'}

Thank you for choosing Lab Link!
  `.trim();

  return {
    subject,
    html: baseEmailTemplate('Booking Confirmation', content),
    text,
  };
}

/**
 * Commission Earned Email
 */
export function commissionEarnedEmail(params: EmailTemplateParams): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Commission Earned - ₹${params.amount}`;
  const content = `
    <h2 style="color: #333333; margin-top: 0;">Commission Earned! 💰</h2>
    <p style="color: #666666; line-height: 1.6;">
      Congratulations! You've earned a commission for a successful booking.
    </p>
    
    <div style="background-color: #f0f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0;">
      <p style="margin: 0; font-size: 32px; font-weight: bold; color: #667eea;">₹${params.amount}</p>
      <p style="margin: 5px 0 0 0; color: #666666;">Commission Amount</p>
    </div>
    
    <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
      <tr>
        <td style="padding: 10px; background-color: #f9f9f9; border: 1px solid #eeeeee; font-weight: bold; color: #333333;">Booking ID</td>
        <td style="padding: 10px; background-color: #ffffff; border: 1px solid #eeeeee; color: #666666;">${params.bookingId}</td>
      </tr>
      <tr>
        <td style="padding: 10px; background-color: #f9f9f9; border: 1px solid #eeeeee; font-weight: bold; color: #333333;">Total Booking Amount</td>
        <td style="padding: 10px; background-color: #ffffff; border: 1px solid #eeeeee; color: #666666;">₹${params.totalAmount}</td>
      </tr>
    </table>
    
    <p style="color: #666666; line-height: 1.6;">
      Your commission will be processed and credited to your account soon.
    </p>
  `;

  const text = `
Commission Earned!

Amount: ₹${params.amount}
Booking ID: ${params.bookingId}
Total Booking Amount: ₹${params.totalAmount}

Your commission will be processed soon.
  `.trim();

  return {
    subject,
    html: baseEmailTemplate('Commission Earned', content),
    text,
  };
}

/**
 * Payment Success Email
 */
export function paymentSuccessEmail(params: EmailTemplateParams): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Payment Successful - Booking ${params.bookingId}`;
  const content = `
    <h2 style="color: #333333; margin-top: 0;">Payment Successful! 💳</h2>
    <p style="color: #666666; line-height: 1.6;">
      Your payment has been processed successfully.
    </p>
    
    <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0;">
      <p style="margin: 0; font-size: 24px; font-weight: bold; color: #10b981;">Payment Confirmed</p>
      <p style="margin: 5px 0 0 0; color: #666666;">Amount: ${params.amount}</p>
    </div>
    
    <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
      <tr>
        <td style="padding: 10px; background-color: #f9f9f9; border: 1px solid #eeeeee; font-weight: bold; color: #333333;">Booking ID</td>
        <td style="padding: 10px; background-color: #ffffff; border: 1px solid #eeeeee; color: #666666;">${params.bookingId}</td>
      </tr>
      <tr>
        <td style="padding: 10px; background-color: #f9f9f9; border: 1px solid #eeeeee; font-weight: bold; color: #333333;">Payment ID</td>
        <td style="padding: 10px; background-color: #ffffff; border: 1px solid #eeeeee; color: #666666;">${params.paymentId}</td>
      </tr>
      <tr>
        <td style="padding: 10px; background-color: #f9f9f9; border: 1px solid #eeeeee; font-weight: bold; color: #333333;">Payment Gateway</td>
        <td style="padding: 10px; background-color: #ffffff; border: 1px solid #eeeeee; color: #666666;">${params.paymentGateway || 'Online Payment'}</td>
      </tr>
    </table>
    
    <p style="color: #666666; line-height: 1.6;">
      Your booking is now confirmed. You will receive further updates via SMS and email.
    </p>
  `;

  const text = `
Payment Successful!

Booking ID: ${params.bookingId}
Payment ID: ${params.paymentId}
Amount: ${params.amount}

Your booking is confirmed.
  `.trim();

  return {
    subject,
    html: baseEmailTemplate('Payment Successful', content),
    text,
  };
}

/**
 * Report Ready Email
 */
export function reportReadyEmail(params: EmailTemplateParams): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Test Report Ready - Booking ${params.bookingId}`;
  const content = `
    <h2 style="color: #333333; margin-top: 0;">Your Test Report is Ready! 📄</h2>
    <p style="color: #666666; line-height: 1.6;">
      Dear ${params.patientName || 'Customer'},
    </p>
    <p style="color: #666666; line-height: 1.6;">
      Your test report for booking ${params.bookingId} is now available for download.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${params.reportUrl || '#'}" style="display: inline-block; background-color: #667eea; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Download Report
      </a>
    </div>
    
    <p style="color: #666666; line-height: 1.6;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="color: #667eea; word-break: break-all;">
      ${params.reportUrl || '#'}
    </p>
  `;

  const text = `
Test Report Ready!

Booking ID: ${params.bookingId}
Patient: ${params.patientName}

Your test report is now available.
Download: ${params.reportUrl || '#'}
  `.trim();

  return {
    subject,
    html: baseEmailTemplate('Report Ready', content),
    text,
  };
}

/**
 * Booking Status Update Email
 */
export function bookingStatusUpdateEmail(params: EmailTemplateParams): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = `Booking Status Update - ${params.bookingId}`;
  const content = `
    <h2 style="color: #333333; margin-top: 0;">Booking Status Updated</h2>
    <p style="color: #666666; line-height: 1.6;">
      Your booking status has been updated.
    </p>
    
    <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
      <tr>
        <td style="padding: 10px; background-color: #f9f9f9; border: 1px solid #eeeeee; font-weight: bold; color: #333333;">Booking ID</td>
        <td style="padding: 10px; background-color: #ffffff; border: 1px solid #eeeeee; color: #666666;">${params.bookingId}</td>
      </tr>
      <tr>
        <td style="padding: 10px; background-color: #f9f9f9; border: 1px solid #eeeeee; font-weight: bold; color: #333333;">Previous Status</td>
        <td style="padding: 10px; background-color: #ffffff; border: 1px solid #eeeeee; color: #666666;">${params.oldStatus}</td>
      </tr>
      <tr>
        <td style="padding: 10px; background-color: #f9f9f9; border: 1px solid #eeeeee; font-weight: bold; color: #333333;">New Status</td>
        <td style="padding: 10px; background-color: #ffffff; border: 1px solid #eeeeee; color: #10b981; font-weight: bold;">${params.newStatus}</td>
      </tr>
    </table>
  `;

  const text = `
Booking Status Updated

Booking ID: ${params.bookingId}
Status: ${params.oldStatus} → ${params.newStatus}
  `.trim();

  return {
    subject,
    html: baseEmailTemplate('Booking Status Update', content),
    text,
  };
}

/**
 * Get email template by name
 */
export function getEmailTemplate(
  templateName: string,
  params: EmailTemplateParams
): { subject: string; html: string; text: string } {
  switch (templateName) {
    case 'booking_confirmation':
      return bookingConfirmationEmail(params);
    case 'commission_earned':
      return commissionEarnedEmail(params);
    case 'payment_success':
      return paymentSuccessEmail(params);
    case 'report_ready':
      return reportReadyEmail(params);
    case 'booking_status_update':
      return bookingStatusUpdateEmail(params);
    default:
      throw new Error(`Email template ${templateName} not found`);
  }
}

