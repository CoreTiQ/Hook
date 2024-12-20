import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const ALLOWED_TYPES = ['success', 'error', 'warning', 'info'] as const;
type WebhookType = typeof ALLOWED_TYPES[number];

export async function POST(req: Request) {
  try {
    // قراءة البيانات
    const body = await req.text();
    console.log('Received body:', body); // لتتبع البيانات المستلمة
    
    const data = JSON.parse(body);
    console.log('Parsed data:', data); // لتتبع البيانات بعد التحليل
    
    // التحقق من البيانات
    if (!data.title || !data.message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // محاولة الإدخال في قاعدة البيانات
    const { data: message, error } = await supabase
      .from('webhook_messages')
      .insert([{
        type: ALLOWED_TYPES.includes(data.type as WebhookType) ? data.type : 'info',
        title: data.title,
        message: data.message,
        metadata: data.metadata || {}
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error); // لتتبع خطأ قاعدة البيانات
      return NextResponse.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: message
    }, { 
      status: 201 
    });

  } catch (error) {
    console.error('Server error:', error); // لتتبع الخطأ
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message // إظهار تفاصيل الخطأ في بيئة التطوير
      },
      { status: 500 }
    );
  }
}