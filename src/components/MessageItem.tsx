import { WebhookMessage } from '@/lib/types'
import { Bell, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { Badge } from "@/components/ui/badge"

interface MessageItemProps {
  message: WebhookMessage
}

export default function MessageItem({ message }: MessageItemProps) {
  const getIcon = (type: string) => {
    const iconProps = { className: "h-5 w-5" }
    switch (type) {
      case 'success': return <CheckCircle {...iconProps} className="text-green-500" />
      case 'error': return <AlertCircle {...iconProps} className="text-red-500" />
      case 'warning': return <AlertTriangle {...iconProps} className="text-yellow-500" />
      case 'info': return <Info {...iconProps} className="text-blue-500" />
      default: return <Bell {...iconProps} />
    }
  }

  const getStyle = (type: string) => {
    switch (type) {
      case 'success': return { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-800' }
      case 'error': return { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-800' }
      case 'warning': return { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-800' }
      case 'info': return { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800' }
      default: return { bg: 'bg-gray-50', border: 'border-gray-200', badge: 'bg-gray-100 text-gray-800' }
    }
  }

  const style = getStyle(message.type)

  return (
    <div className={`rounded-lg border p-4 ${style.bg} ${style.border}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getIcon(message.type)}
          <Badge variant="outline" className={style.badge}>
            {message.type}
          </Badge>
          <span className="text-sm text-gray-500 dir-ltr">
            {new Date(message.created_at).toLocaleString('ar-SA')}
          </span>
        </div>
      </div>
      <h3 className="mt-2 font-bold text-lg">{message.title}</h3>
      <p className="mt-1 text-gray-600">{message.message}</p>
      {message.metadata && Object.keys(message.metadata).length > 0 && (
        <div className="mt-3 p-2 bg-white bg-opacity-50 rounded-md">
          <h4 className="font-medium mb-2">البيانات الإضافية:</h4>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(message.metadata).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center p-1 border-b border-dashed">
                <span className="font-medium text-gray-600">{key}:</span>
                <span className="text-gray-800">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}