import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

// تعريف الأنواع المسموح بها
const ALLOWED_TYPES = ['success', 'error', 'warning', 'info'] as const;
type WebhookType = typeof ALLOWED_TYPES[number];

export async function POST(req: Request) {
  try {
    // تحليل البيانات مباشرة
    const body = await req.text();
    const data = JSON.parse(body);
    
    // التحقق من البيانات المطلوبة
    if (!data.title || !data.message) {
      return NextResponse.json(
        { error: 'Missing required fields', message: 'title and message are required' },
        { status: 400 }
      );
    }

    // إضافة البيانات لقاعدة البيانات
    const { data: message, error } = await supabase
      .from('webhook_messages')
      .insert([{
        type: ALLOWED_TYPES.includes(data.type as WebhookType) ? data.type : 'info',
        title: data.title,
        message: data.message,
        metadata: data.metadata || {},
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    // إرجاع الرد
    return NextResponse.json({
      success: true,
      data: message,
      requestId: crypto.randomUUID()
    }, { 
      status: 201 
    });

  } catch (error) {
    console.error('Webhook error:', error);
    
    // التحقق من نوع الخطأ
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON', message: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}