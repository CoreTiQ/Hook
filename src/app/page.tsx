'use client'

import { useEffect, useState } from 'react'
import { Loader2, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Message {
  id: string
  type: 'success' | 'error' | 'info' | 'warning' | 'discord'
  title: string
  message: string
  metadata?: any
  created_at: string
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMessages()
    setupRealtimeSubscription()
  }, [])

  const fetchMessages = async () => {
    try {
      const { data } = await supabase
        .from('webhook_messages')
        .select('*')
        .order('created_at', { ascending: false })
      
      setMessages(data || [])
      setLoading(false)
    } catch (error) {
      console.error('Error:', error)
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('webhook_messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'webhook_messages' },
        payload => {
          setMessages(prev => [payload.new as Message, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'error': return <AlertCircle className="h-6 w-6 text-red-500" />
      case 'warning': return <AlertTriangle className="h-6 w-6 text-yellow-500" />
      case 'info': default: return <Info className="h-6 w-6 text-blue-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">لوحة رسائل Webhook</h1>
            <span className="px-3 py-1 bg-gray-100 rounded-full text-sm">
              {messages.length} رسالة
            </span>
          </div>
          <p className="mt-2 text-gray-600">
            عرض وإدارة جميع رسائل Webhook الواردة
          </p>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className="rounded-lg p-4 border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">
                      {getMessageIcon(message.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">
                          {message.title}
                        </h3>
                        <time className="text-sm text-gray-500">
                          {new Date(message.created_at).toLocaleString('ar-SA')}
                        </time>
                      </div>
                      <p className="mt-1 text-gray-700">
                        {message.message}
                      </p>
                      {message.metadata && Object.keys(message.metadata).length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(message.metadata).map(([key, value]) => (
                              <div key={key} className="flex justify-between items-center text-sm">
                                <span className="font-medium text-gray-600">{key}:</span>
                                <span>{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Info className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">لا توجد رسائل</h3>
              <p className="mt-2 text-gray-500">
                لم يتم استلام أي رسائل webhook حتى الآن
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}