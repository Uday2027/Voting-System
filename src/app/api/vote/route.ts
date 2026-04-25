import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getCurrentVoter } from '@/lib/auth';
import { z } from 'zod';
import { logSecurityEvent } from '@/lib/audit';
import { getClientIp, getDeviceInfo } from '@/lib/ip';

const voteSchema = z.object({
  electionId: z.string().uuid(),
  candidateId: z.string().uuid(),
  auditPhoto: z.string().optional(), // Base64 string
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const deviceInfo = getDeviceInfo(request);
  const session = await getCurrentVoter();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { electionId, candidateId, auditPhoto } = voteSchema.parse(body);

    let photoUrl = null;
    
    // Handle audit photo upload
    if (auditPhoto && auditPhoto.startsWith('data:image/jpeg;base64,')) {
      try {
        const base64Data = auditPhoto.replace('data:image/jpeg;base64,', '');
        const buffer = Buffer.from(base64Data, 'base64');
        const fileName = `elections/${electionId}/voter_${session.voterId}_${Date.now()}.jpg`;

        const { error: uploadError } = await supabaseAdmin.storage
          .from('audit-photos')
          .upload(fileName, buffer, {
            contentType: 'image/jpeg',
            upsert: true
          });

        if (uploadError) {
          console.error('Photo upload error:', uploadError);
        } else {
          photoUrl = fileName;
        }
      } catch (err) {
        console.error('Failed to process audit photo:', err);
      }
    }

    // Verify session match
    if (session.electionId !== electionId) {
      await logSecurityEvent('VOTE_FRAUD_ATTEMPT', ip, { 
        voter_id: session.voterId, 
        metadata: { reason: 'election_id_mismatch', target: electionId } 
      });
      return NextResponse.json({ error: 'Invalid election' }, { status: 400 });
    }

    // Call the atomic stored procedure
    const { data: receiptToken, error } = await supabaseAdmin.rpc('cast_vote', {
      p_voter_id: session.voterId,
      p_election_id: electionId,
      p_candidate_id: candidateId,
    });

    if (error) {
      console.error('Voting error:', error);
      
      if (error.message.includes('already cast a ballot')) {
        await logSecurityEvent('DUPLICATE_VOTE_ATTEMPT', ip, { 
          voter_id: session.voterId, 
          election_id: electionId 
        });
        return NextResponse.json({ error: 'You have already cast your vote.' }, { status: 403 });
      }

      if (error.message.includes('not open')) {
        return NextResponse.json({ error: 'This election is not currently open.' }, { status: 403 });
      }

      return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 });
    }

    await logSecurityEvent('VOTE_CAST_SUCCESS', ip, { 
      voter_id: session.voterId, 
      election_id: electionId,
      metadata: { 
        photo_path: photoUrl,
        has_photo: !!photoUrl,
        device: deviceInfo
      }
    });

    return NextResponse.json({ success: true, receiptToken });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
