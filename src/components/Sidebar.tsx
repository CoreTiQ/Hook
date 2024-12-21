import { Home, MessageSquare, LineChart, Settings, Users } from 'lucide-react'
import Link from 'next/link'

export default function Sidebar() {
  const menuItems = [
    { icon: Home, label: 'الرئيسية', href: '/' },
    { icon: MessageSquare, label: 'الرسائل', href: '/messages' },
    { icon: LineChart, label: 'الإحصائيات', href: '/stats' },
    { icon: Users, label: 'المستخدمين', href: '/users' },
    { icon: Settings, label: 'الإعدادات', href: '/settings' },
  ]

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-l dark:border-gray-700">
      <div className="h-16 flex items-center px-6 border-b dark:border-gray-700">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          Webhook Dashboard
        </h2>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item, i) => (
            <li key={i}>
              <Link href={item.href} 
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}