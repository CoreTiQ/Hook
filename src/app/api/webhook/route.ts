import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('x-webhook-signature');
    const body = await req.text();
    
    if (!verifySignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const data = JSON.parse(body);
    
    const { data: message, error } = await supabase
      .from('webhook_messages')
      .insert([{
        type: data.type || 'info',
        title: data.title,
        message: data.message,
        metadata: data.metadata || {}
      }])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(message);
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function verifySignature(body: string, signature?: string | null) {
  if (!signature || !process.env.WEBHOOK_SECRET) return false;
  
  const hmac = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(body)
    .digest('hex');
    
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(hmac)
  );
}