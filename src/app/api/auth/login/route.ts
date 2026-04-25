import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase';
import { signToken, setSessionCookie } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { logSecurityEvent } from '@/lib/audit';
import { getClientIp, getDeviceInfo } from '@/lib/ip';

const loginSchema = z.object({
  voterId: z.string().uuid(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const deviceInfo = getDeviceInfo(request);

  // 1. Rate Limiting
  if (!checkRateLimit(ip)) {
    await logSecurityEvent('RATE_LIMIT_EXCEEDED', ip, { metadata: { path: '/api/auth/login' } });
    return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { voterId, password } = loginSchema.parse(body);

    // 2. Fetch voter
    const { data: voter, error } = await supabaseAdmin
      .from('voters')
      .select('*')
      .eq('id', voterId)
      .single();

    // 3. Verify credentials
    // Use generic error message to prevent userId enumeration
    const genericError = { error: 'Invalid credentials' };

    if (error || !voter) {
      await logSecurityEvent('LOGIN_FAILED', ip, { 
        voter_id: voterId, 
        metadata: { reason: 'voter_not_found', device: deviceInfo } 
      });
      return NextResponse.json(genericError, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, voter.password_hash);
    if (!isPasswordValid) {
      await logSecurityEvent('LOGIN_FAILED', ip, { voter_id: voterId, metadata: { reason: 'invalid_password' } });
      return NextResponse.json(genericError, { status: 401 });
    }

    // 4. Issue JWT and set cookie
    const token = await signToken({
      voterId: voter.id,
      electionId: voter.election_id,
    });

    setSessionCookie(token);

    await logSecurityEvent('LOGIN_SUCCESS', ip, { 
      voter_id: voterId, 
      election_id: voter.election_id,
      metadata: { device: deviceInfo }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    
    console.error('Login error:', error);
    // Generic error to avoid exposing internals
    return NextResponse.json({ error: 'An internal server error occurred' }, { status: 500 });
  }
}
