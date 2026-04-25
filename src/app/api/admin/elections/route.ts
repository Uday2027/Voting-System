import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdminAuthorized } from '@/lib/admin-auth';
import { z } from 'zod';

const electionSchema = z.object({
  title: z.string().min(1),
  description: z.string(),
  startsAt: z.string(),
  endsAt: z.string(),
  candidates: z.array(z.object({
    name: z.string().min(1),
    description: z.string().optional(),
  })).min(1),
});

export async function POST(request: NextRequest) {
  if (!isAdminAuthorized()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, description, startsAt, endsAt, candidates } = electionSchema.parse(body);

    // 1. Insert Election
    const { data: election, error: electionError } = await supabaseAdmin
      .from('elections')
      .insert({
        title,
        description,
        starts_at: startsAt,
        ends_at: endsAt,
        status: 'PENDING',
      })
      .select()
      .single();

    if (electionError || !election) {
      return NextResponse.json({ message: 'Failed to create election' }, { status: 500 });
    }

    // 2. Insert Candidates
    const candidatesToInsert = candidates.map((c, index) => ({
      election_id: election.id,
      name: c.name,
      description: c.description || '',
      display_order: index,
    }));

    const { error: candidatesError } = await supabaseAdmin
      .from('candidates')
      .insert(candidatesToInsert);

    if (candidatesError) {
      // In a real app, we'd roll back the election insert here
      return NextResponse.json({ message: 'Failed to add candidates' }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: election.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid input data' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  if (!isAdminAuthorized()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: elections, error } = await supabaseAdmin
    .from('elections')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ message: 'Failed to fetch elections' }, { status: 500 });
  }

  return NextResponse.json(elections);
}
