// src/app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { WebhookMessage } from '@/lib/types'

export default function Home() {
  const [messages, setMessages] = useState<WebhookMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMessages()
    setupRealtimeSubscription()
  }, [])

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('webhook_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'webhook_messages'
        },
        (payload) => {
          setMessages(prev => [payload.new as WebhookMessage, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('webhook_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">لوحة رسائل Webhook</h1>
        
        {loading ? (
          <div>جاري التحميل...</div>
        ) : messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className="p-4 border rounded-lg"
              >
                <h3 className="font-bold">{message.title}</h3>
                <p>{message.message}</p>
                <div className="text-sm text-gray-500 mt-2">
                  {new Date(message.created_at).toLocaleString('ar-SA')}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p>لا توجد رسائل</p>
          </div>
        )}
        
        <Button 
          onClick={fetchMessages}
          className="mt-4"
        >
          تحديث
        </Button>
      </Card>
    </div>
  )
}