'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { WebhookMessage } from '@/lib/types';
import { supabase } from '@/lib/supabase';

export default function MessagesList() {
  const [messages, setMessages] = useState<WebhookMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
    
    // إعداد Supabase Realtime للتحديثات المباشرة
    const subscription = supabase
      .channel('webhook_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'webhook_messages'
        },
        (payload) => {
          setMessages(prev => [payload.new as WebhookMessage, ...prev]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchMessages() {
    try {
      const { data, error } = await supabase
        .from('webhook_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }