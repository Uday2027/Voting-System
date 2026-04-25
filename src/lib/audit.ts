import { supabaseAdmin } from './supabase';

export async function logSecurityEvent(
  eventType: string,
  ipAddress: string,
  details: { voter_id?: string; election_id?: string; metadata?: Record<string, unknown> }
) {
  try {
    await supabaseAdmin.from('audit_log').insert({
      event_type: eventType,
      ip_address: ipAddress,
      voter_id: details.voter_id,
      election_id: details.election_id,
      metadata: details.metadata,
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}
