/**
 * Input Sanitization Utilities
 */

/**
 * Sanitize string input - remove HTML tags and dangerous characters
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';

  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove remaining angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';

  // Basic email validation and sanitization
  const sanitized = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }

  return sanitized;
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string): string {
  if (typeof phone !== 'string') return '';

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');

  // Validate Indian phone number (10 digits)
  if (digits.length !== 10) {
    throw new Error('Phone number must be 10 digits');
  }

  return digits;
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(input: string | number, min?: number, max?: number): number {
  const num = typeof input === 'string' ? parseFloat(input) : input;

  if (isNaN(num)) {
    throw new Error('Invalid number');
  }

  if (min !== undefined && num < min) {
    throw new Error(`Number must be at least ${min}`);
  }

  if (max !== undefined && num > max) {
    throw new Error(`Number must be at most ${max}`);
  }

  return num;
}

/**
 * Sanitize object - recursively sanitize object properties
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  schema: Record<keyof T, (value: any) => any>
): T {
  const sanitized = { ...obj };

  for (const [key, sanitizer] of Object.entries(schema)) {
    if (key in sanitized) {
      try {
        sanitized[key as keyof T] = sanitizer(sanitized[key]);
      } catch (error) {
        // Remove invalid fields
        delete sanitized[key as keyof T];
      }
    }
  }

  return sanitized;
}

/**
 * Sanitize URL
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') return '';

  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid URL protocol');
    }

    return parsed.toString();
  } catch {
    throw new Error('Invalid URL format');
  }
}

/**
 * Escape HTML entities
 */
export function escapeHtml(text: string): string {
  if (typeof text !== 'string') return '';

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return text.replace(/[&<>"']/g, (m) => map[m]);
}

