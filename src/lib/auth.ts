import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { JWTPayload } from '@/types';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
const COOKIE_NAME = 'voting_session';

/**
 * Creates a signed JWT token for a voter session.
 */
export async function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>) {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('2h')
    .sign(SECRET);
}

/**
 * Verifies a JWT token.
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

/**
 * Sets the session cookie.
 */
export function setSessionCookie(token: string) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 2, // 2 hours
    path: '/',
  });
}

/**
 * Gets the session token from cookies.
 */
export function getSessionToken() {
  return cookies().get(COOKIE_NAME)?.value;
}

/**
 * Gets the current voter payload from session.
 */
export async function getCurrentVoter(): Promise<JWTPayload | null> {
  const token = getSessionToken();
  if (!token) return null;
  return await verifyToken(token);
}

/**
 * Clears the session cookie.
 */
export function clearSessionCookie() {
  cookies().delete(COOKIE_NAME);
}
