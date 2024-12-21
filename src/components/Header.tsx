import { Bell, Settings, Sun, Moon } from 'lucide-react'
import { Button } from './ui/button'
import { useTheme } from 'next-themes'

export default function Header() {
  const { setTheme, theme } = useTheme()

  return (
    <header className="h-16 border-b bg-white dark:bg-gray-800 dark:border-gray-700">
      <div className="h-full px-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">لوحة التحكم</h1>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          
          <Button variant="outline" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
          
          <Button variant="outline" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
