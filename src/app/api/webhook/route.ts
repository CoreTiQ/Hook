import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';
import { z } from 'zod';

// تعريف المتغيرات الثابتة
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "11";
const MAX_BODY_SIZE = 100 * 1024; // 100KB
const ALLOWED_TYPES = ['success', 'error', 'warning', 'info'] as const;

// تعريف شكل البيانات المتوقع باستخدام Zod
const WebhookSchema = z.object({
  type: z.enum(ALLOWED_TYPES).default('info'),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  metadata: z.record(z.any()).optional().default({}),
  source: z.string().optional(),
  timestamp: z.string().optional().default(() => new Date().toISOString())
});

type WebhookPayload = z.infer<typeof WebhookSchema>;

export async function POST(req: Request) {
  try {
    // التحقق من حجم البيانات
    const contentLength = parseInt(req.headers.get('content-length') || '0');
    if (contentLength > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: 'Request body too large' },
        { status: 413 }
      );
    }

    // التحقق من نوع المحتوى
    const contentType = req.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 415 }
      );
    }

    // قراءة البيانات والتحقق من التوقيع
    const body = await req.text();
    const signature = req.headers.get('x-webhook-signature');

    if (!verifySignature(body, signature)) {
      return NextResponse.json(
        { 
          error: 'Invalid signature',
          message: 'Please ensure you are sending the correct signature in x-webhook-signature header'
        },
        { status: 401 }
      );
    }

    // تحليل وتحقق من البيانات
    const rawData = JSON.parse(body);
    const validationResult = await WebhookSchema.safeParseAsync(rawData);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid payload',
          details: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // إضافة معلومات إضافية للبيانات
    const enrichedData = {
      ...data,
      ip: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown',
      created_at: new Date().toISOString()
    };

    // حفظ في قاعدة البيانات
    const { data: message, error } = await supabase
      .from('webhook_messages')
      .insert([enrichedData])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    // إرسال الرد
    return NextResponse.json({
      success: true,
      message: 'Webhook received and processed successfully',
      data: message
    }, {
      status: 201,
      headers: {
        'X-Rate-Limit-Remaining': '999', // يمكن تنفيذ نظام rate limiting هنا
        'X-Request-ID': crypto.randomUUID()
      }
    });

  } catch (error) {
    console.error('Webhook error:', error);
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

function verifySignature(body: string, signature?: string | null): boolean {
  if (!signature || !WEBHOOK_SECRET) {
    return false;
  }

  try {
    const hmac = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(body)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(hmac)
    );
  } catch {
    return false;
  }
}

// للمساعدة في الاختبار وإعادة الاستخدام
export function generateSignature(payload: WebhookPayload): string {
  const body = JSON.stringify(payload);
  return crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(body)
    .digest('hex');
}