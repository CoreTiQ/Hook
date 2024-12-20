// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bsruyzcvixmowxdkygtk.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzcnV5emN2aXhtb3d4ZGt5Z3RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2OTQ0MDgsImV4cCI6MjA1MDI3MDQwOH0.LzvE_Dy1JbldyNYGgknUdTC4gp4Pltt8MH0YLJ8IrZI';

// التحقق من وجود المتغيرات المطلوبة
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// إنشاء عميل Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

// دالة للتحقق من الاتصال
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('webhook_messages')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Supabase check failed:', error);
    return false;
  }
}