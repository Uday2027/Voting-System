import { cookies } from 'next/headers';

/**
 * Checks if the current request is authorized as admin.
 * Uses a cookie to store the ADMIN_SECRET_KEY temporarily for the session.
 */
export function isAdminAuthorized() {
  const adminKey = cookies().get('admin_secret')?.value;
  return adminKey === process.env.ADMIN_SECRET_KEY;
}

/**
 * Verifies if a given key is the correct admin secret key.
 */
export function verifyAdminKey(key: string) {
  return key === process.env.ADMIN_SECRET_KEY;
}
