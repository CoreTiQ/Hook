// src/app/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Bell, Filter, Search, Loader2, RefreshCcw } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { supabase } from '@/lib/supabase'
import { WebhookMessage } from '@/lib/types'
import MessageItem from '@/components/MessageItem'

export default function Home() {
  // State
  const [messages, setMessages] = useState<WebhookMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Message Types
  const messageTypes = [
    { value: 'all', label: 'جميع الأنواع' },
    { value: 'success', label: 'نجاح', color: 'bg-green-100 text-green-800' },
    { value: 'error', label: 'خطأ', color: 'bg-red-100 text-red-800' },
    { value: 'info', label: 'معلومات', color: 'bg-blue-100 text-blue-800' },
    { value: 'warning', label: 'تحذير', color: 'bg-yellow-100 text-yellow-800' }
  ]

  // Fetch initial data
  useEffect(() => {
    fetchMessages()
    setupRealtimeSubscription()
  }, [])

  // Real-time subscription setup
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
          const newMessage = payload.new as WebhookMessage
          setMessages(prev => {
            // Check if message already exists
            if (prev.some(msg => msg.id === newMessage.id)) {
              return prev
            }
            return [newMessage, ...prev]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  // Fetch messages from Supabase
  const fetchMessages = async () => {
    try {
      setLoading(true)
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

  // Refresh messages
  const refreshMessages = async () => {
    setRefreshing(true)
    await fetchMessages()
    setRefreshing(false)
  }

  // Filter messages based on search and type
  const filteredMessages = messages.filter(message => {
    const matchesSearch = searchTerm === '' || 
      message.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = selectedType === 'all' || message.type === selectedType

    return matchesSearch && matchesType
  })

  // Get statistics
  const getStats = () => {
    const total = messages.length
    const typeStats = messages.reduce((acc, msg) => {
      acc[msg.type] = (acc[msg.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return { total, typeStats }
  }

  const stats = getStats()

  return (
    <div className="container mx-auto py-8">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CardTitle className="text-2xl font-bold">لوحة رسائل Webhook</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={refreshMessages}
                className={refreshing ? 'animate-spin' : ''}
                disabled={refreshing}
              >
                <RefreshCcw className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">الإحصائيات</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>إحصائيات الرسائل</AlertDialogTitle>
                    <AlertDialogDescription>
                      <div className="space-y-2">
                        <p>إجمالي الرسائل: {stats.total}</p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(stats.typeStats).map(([type, count]) => (
                            <Badge 
                              key={type}
                              variant="outline" 
                              className={messageTypes.find(t => t.value === type)?.color}
                            >
                              {messageTypes.find(t => t.value === type)?.label}: {count}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogAction>إغلاق</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <CardDescription>
            عرض وإدارة جميع رسائل Webhook الواردة
          </CardDescription>

          {showFilters && (
            <div className="mt-4 space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="بحث في الرسائل..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pr-10"
                  />
                </div>
                <Select
                  value={selectedType}
                  onValueChange={setSelectedType}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="نوع الرسالة" />
                  </SelectTrigger>
                  <SelectContent>
                    {messageTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="flex items-center gap-2">
                          {type.label}
                          {type.value !== 'all' && (
                            <Badge variant="outline" className={type.color}>
                              {stats.typeStats[type.value] || 0}
                            </Badge>
                          )}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>
                  {filteredMessages.length} من {messages.length} رسالة
                </span>
                {(searchTerm || selectedType !== 'all') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchTerm('')
                      setSelectedType('all')
                    }}
                  >
                    مسح الفلتر
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredMessages.length > 0 ? (
            <div className="space-y-4">
              {filteredMessages.map((message) => (
                <MessageItem key={message.id} message={message} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bell className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">لا توجد رسائل</h3>
              <p className="mt-2 text-gray-500">
                {searchTerm || selectedType !== 'all'
                  ? 'لا توجد نتائج تطابق معايير البحث'
                  : 'لم يتم استلام أي رسائل بعد'}
              </p>
            </div>
          )}

          {filteredMessages.length > 0 && (
            <div className="mt-4 text-center">
              <Button
                variant="outline"
                onClick={refreshMessages}
                disabled={refreshing}
              >
                {refreshing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري التحديث...
                  </>
                ) : (
                  'تحديث الرسائل'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}