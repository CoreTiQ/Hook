import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const signature = req.headers.get('x-webhook-signature');
    const body = await req.text();

    // التحقق من التوقيع
    if (!verifySignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const data = JSON.parse(body);

    // إدخال البيانات في قاعدة البيانات
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

    return NextResponse.json(message, { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function verifySignature(body: string, signature?: string | null): boolean {
  const WEBHOOK_SECRET = "11"; // المفتاح السري الثابت
  if (!signature) {
    console.error('Missing signature');
    return false;
  }

  try {
    const hmac = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(body)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature, 'utf-8'),
      Buffer.from(hmac, 'utf-8')
    );
  } catch (err) {
    console.error('Error verifying signature:', err);
    return false;
  }
}
