import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdminAuthorized } from '@/lib/admin-auth';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const generateSchema = z.object({
  electionId: z.string().uuid(),
  count: z.number().min(1).max(1000),
  emails: z.array(z.string().email()).optional(),
});

export async function POST(request: NextRequest) {
  if (!isAdminAuthorized()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { electionId, count, emails } = generateSchema.parse(body);

    const { data: election } = await supabaseAdmin
      .from('elections')
      .select('title')
      .eq('id', electionId)
      .single();

    const credentials: { userId: string; password: string; email?: string }[] = [];
    const votersToInsert: any[] = [];
    const sessionsToInsert: any[] = [];

    for (let i = 0; i < count; i++) {
      const userId = uuidv4();
      const password = Math.random().toString(36).slice(-12);
      const passwordHash = await bcrypt.hash(password, 12);
      const email = emails?.[i];

      credentials.push({ userId, password, email });
      votersToInsert.push({
        id: userId,
        election_id: electionId,
        password_hash: passwordHash,
        email: email || null,
      });

      sessionsToInsert.push({
        voter_id: userId,
        election_id: electionId,
        has_voted: false,
      });
    }

    // Insert in batches if count is high
    const { error: votersError } = await supabaseAdmin
      .from('voters')
      .insert(votersToInsert);

    if (votersError) {
      console.error('Failed to insert voters:', votersError);
      return NextResponse.json({ message: 'Failed to generate voters' }, { status: 500 });
    }

    const { error: sessionsError } = await supabaseAdmin
      .from('voter_sessions')
      .insert(sessionsToInsert);

    if (sessionsError) {
      console.error('Failed to insert voter sessions:', sessionsError);
      // We don't return 500 here yet because voters are already in, but it's bad.
    }

    // Send emails if SMTP is configured and emails are provided
    if (process.env.SMTP_HOST && emails && emails.length > 0) {
      try {
        for (const cred of credentials) {
          if (cred.email) {
            await transporter.sendMail({
              from: process.env.SMTP_FROM || '"Voting System" <noreply@example.com>',
              to: cred.email,
              subject: `Your Credentials for ${election?.title || 'the Election'}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
                  <div style="background: #2563eb; padding: 32px; text-align: center;">
                    <h1 style="color: white; margin: 0; font-size: 24px;">Secure Voting Credentials</h1>
                  </div>
                  <div style="padding: 32px; background: white;">
                    <p style="color: #475569; font-size: 16px; line-height: 1.5;">You have been registered to vote in <strong>${election?.title || 'the upcoming election'}</strong>.</p>
                    <p style="color: #475569; font-size: 16px;">Use the following credentials to cast your ballot:</p>
                    
                    <div style="background: #f8fafc; padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid #e2e8f0;">
                      <p style="margin: 0 0 12px 0; font-family: monospace;"><strong>Voter ID:</strong> <span style="color: #2563eb;">${cred.userId}</span></p>
                      <p style="margin: 0; font-family: monospace;"><strong>Password:</strong> <span style="color: #2563eb;">${cred.password}</span></p>
                    </div>
                    
                    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/login" style="display: block; width: 100%; text-align: center; background: #2563eb; color: white; padding: 14px; border-radius: 10px; text-decoration: none; font-weight: bold; margin-top: 24px;">
                      Go to Voting Portal
                    </a>
                    
                    <p style="color: #94a3b8; font-size: 12px; margin-top: 32px; text-align: center; border-top: 1px solid #f1f5f9; pt: 16px;">
                      Please keep these credentials secure. Do not share them with anyone.
                    </p>
                  </div>
                </div>
              `,
            });
          }
        }
      } catch (emailError) {
        console.error('Failed to send some emails:', emailError);
      }
    }

    // Generate CSV content
    const csvHeader = 'userId,password,email\n';
    const csvRows = credentials.map(c => `${c.userId},${c.password},${c.email || ''}`).join('\n');
    const csvContent = csvHeader + csvRows;

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="voters_${electionId}.csv"`,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Invalid input' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
