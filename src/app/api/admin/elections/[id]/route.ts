import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdminAuthorized } from '@/lib/admin-auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdminAuthorized()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = {};
    
    if (body.status) {
      if (!['PENDING', 'OPEN', 'CLOSED'].includes(body.status)) {
        return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
      }
      updates.status = body.status;
    }

    if (body.results_frozen !== undefined) {
      updates.results_frozen = body.results_frozen;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: 'No updates provided' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('elections')
      .update(updates)
      .eq('id', params.id);

    if (error) {
      return NextResponse.json({ message: 'Failed to update election' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
