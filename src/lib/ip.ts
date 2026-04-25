import { NextRequest } from 'next/server';

/**
 * Extracts the most accurate client IP address from a request.
 * Handles proxies, Vercel, and local development.
 */
export function getClientIp(request: NextRequest): string {
  // 1. Check for X-Forwarded-For (standard for proxies)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // If there are multiple IPs, the first one is the original client
    return forwarded.split(',')[0].trim();
  }

  // 2. Check for X-Real-IP (common in Nginx/Vercel)
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  // 3. Next.js built-in IP detection (works on Vercel)
  if (request.ip) return request.ip;

  // 4. Fallback
  return '127.0.0.1';
}

import { UAParser } from 'ua-parser-js';

export function getDeviceInfo(request: NextRequest) {
  const ua = request.headers.get('user-agent') || '';
  const parser = new UAParser(ua);
  const result = parser.getResult();

  return {
    browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
    os: `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim(),
    device: result.device.type === 'mobile' ? 'Mobile' : result.device.type === 'tablet' ? 'Tablet' : 'Desktop',
    raw: ua
  };
}
