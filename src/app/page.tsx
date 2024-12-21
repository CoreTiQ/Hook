'use client';

import { useEffect, useState } from 'react';
import { 
  Card, CardContent, CardHeader, CardTitle, CardDescription 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Loader2, AlertCircle, CheckCircle, Info, AlertTriangle,
  RefreshCw, Filter, Search, MoreVertical 
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'discord';
  title: string;
  message: string;
  metadata?: any;
  created_at: string;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMessages();
    setupRealtimeSubscription();
  }, []);

  const fetchMessages = async () => {
    try {
      setRefreshing(true);
      const { data } = await supabase
        .from('webhook_messages')
        .select('*')
        .order('created_at', { ascending: false });
      
      setMessages(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('webhook_messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'webhook_messages' },
        payload => {
          setMessages(prev => [payload.new as Message, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'error': return <AlertCircle className="h-6 w-6 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'info': default: return <Info className="h-6 w-6 text-blue-500" />;
    }
  };

  const getMessageStyle = (type: string) => {
    switch (type) {
      case 'success': return 'border-l-4 border-l-green-500 bg-green-50/50 hover:bg-green-50';
      case 'error': return 'border-l-4 border-l-red-500 bg-red-50/50 hover:bg-red-50';
      case 'warning': return 'border-l-4 border-l-yellow-500 bg-yellow-50/50 hover:bg-yellow-50';
      case 'info': default: return 'border-l-4 border-l-blue-500 bg-blue-50/50 hover:bg-blue-50';
    }
  };

  const filteredMessages = messages.filter(message => {
    const typeMatch = filter === 'all' || message.type === filter;
    const searchMatch = !searchTerm || 
      message.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase());
    return typeMatch && searchMatch;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8">
      <Card className="max-w-5xl mx-auto bg-white dark:bg-gray-800 shadow-xl">
        <CardHeader className="space-y-4 border-b dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">لوحة رسائل Webhook</CardTitle>
              <CardDescription className="mt-1 text-gray-500 dark:text-gray-400">
                عرض وإدارة جميع رسائل Webhook الواردة
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-sm px-3 py-1">
                {filteredMessages.length} رسالة
              </Badge>
              <Button
                variant="outline"
                size="icon"
                onClick={fetchMessages}
                disabled={refreshing}
                className="hover:text-blue-600"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="بحث في الرسائل..."
                className="w-full h-10 pl-4 pr-10 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="h-10 px-3 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">جميع الرسائل</option>
              <option value="success">ناجحة</option>
              <option value="error">خطأ</option>
              <option value="warning">تحذير</option>
              <option value="info">معلومات</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredMessages.length > 0 ? (
            <div className="space-y-4">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`rounded-lg p-4 transition-all duration-200 hover:shadow-md ${getMessageStyle(message.type)}`}
                >
                  <div className="flex items-start space-x-4 rtl:space-x-reverse">
                    <div className="flex-shrink-0 mt-1">
                      {getMessageIcon(message.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {message.title}
                        </h3>
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                          {new Date(message.created_at).toLocaleString('ar-SA')}
                        </span>
                      </div>
                      <p className="mt-1 text-gray-700 dark:text-gray-300">
                        {message.message}
                      </p>
                      {message.metadata && Object.keys(message.metadata).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(message.metadata).map(([key, value]) => (
                              <div key={key} className="flex justify-between items-center text-sm">
                                <span className="font-medium text-gray-600 dark:text-gray-400">{key}:</span>
                                <span className="text-gray-900 dark:text-gray-300">{String(value)}</span>
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
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">لا توجد رسائل</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                {searchTerm || filter !== 'all' 
                  ? 'لا توجد نتائج تطابق معايير البحث'
                  : 'لم يتم استلام أي رسائل webhook حتى الآن'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}