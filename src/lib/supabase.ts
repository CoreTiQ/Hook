// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// بيانات الاتصال بـ Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bsruyzcvixmowxdkygtk.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJzcnV5emN2aXhtb3d4ZGt5Z3RrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2OTQ0MDgsImV4cCI6MjA1MDI3MDQwOH0.LzvE_Dy1JbldyNYGgknUdTC4gp4Pltt8MH0YLJ8IrZI';

// تعريف أنواع البيانات
export type WebhookMessage = {
  id: string;
  type: string;
  title: string;
  message: string;
  metadata?: {
    username?: string;
    avatar_url?: string;
    embeds?: Array<{
      title?: string;
      description?: string;
      color?: number;
      fields?: Array<{
        name: string;
        value: string;
        inline?: boolean;
      }>;
      thumbnail?: {
        url: string;
      };
      image?: {
        url: string;
      };
      footer?: {
        text: string;
        icon_url?: string;
      };
      timestamp?: string;
    }>;
  };
  created_at: string;
};

// إنشاء عميل Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  }
});

// دالة للتحقق من الاتصال بقاعدة البيانات
export const checkDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('webhook_messages')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Database connection error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Database check failed:', error);
    return false;
  }
};

// دالة لإضافة رسالة جديدة
export const addMessage = async (message: Omit<WebhookMessage, 'id' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('webhook_messages')
      .insert([message])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding message:', error);
    throw error;
  }
};

// دالة لجلب آخر الرسائل
export const getLatestMessages = async (limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('webhook_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// دالة لحذف رسالة
export const deleteMessage = async (id: string) => {
  try {
    const { error } = await supabase
      .from('webhook_messages')
      .delete()
      .match({ id });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

// تصدير نسخة من العميل للاستخدام في أماكن أخرى
export default supabase;