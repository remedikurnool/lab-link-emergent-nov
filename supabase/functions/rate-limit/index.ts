import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60; // 1 minute in seconds
const RATE_LIMIT_MAX_REQUESTS = 100; // Max requests per window

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store (in production, use Redis or Supabase)
const rateLimitStore: RateLimitStore = {};

function getRateLimitKey(identifier: string): string {
  return `ratelimit:${identifier}`;
}

function checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
  const key = getRateLimitKey(identifier);
  const now = Date.now();
  const windowMs = RATE_LIMIT_WINDOW * 1000;

  if (!rateLimitStore[key] || rateLimitStore[key].resetTime < now) {
    // Reset or initialize
    rateLimitStore[key] = {
      count: 1,
      resetTime: now + windowMs,
    };
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX_REQUESTS - 1,
      resetTime: rateLimitStore[key].resetTime,
    };
  }

  if (rateLimitStore[key].count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: rateLimitStore[key].resetTime,
    };
  }

  rateLimitStore[key].count += 1;
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX_REQUESTS - rateLimitStore[key].count,
    resetTime: rateLimitStore[key].resetTime,
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Get identifier (IP address or user ID)
    const authHeader = req.headers.get('authorization');
    let identifier = req.headers.get('x-forwarded-for') || 'unknown';

    // If authenticated, use user ID
    if (authHeader) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {
          global: {
            headers: { Authorization: authHeader },
          },
        }
      );

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        identifier = user.id;
      }
    }

    // Check rate limit
    const rateLimit = checkRateLimit(identifier);

    const headers = new Headers({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'X-RateLimit-Limit': RATE_LIMIT_MAX_REQUESTS.toString(),
      'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(rateLimit.resetTime / 1000).toString(),
    });

    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000),
        }),
        {
          status: 429,
          headers,
        }
      );
    }

    // Forward request to actual function or return success
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Rate limit check passed',
        remaining: rateLimit.remaining,
      }),
      {
        status: 200,
        headers,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});

