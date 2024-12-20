@echo off
echo Creating project structure...

:: Create directories
mkdir src\app\api\webhook
mkdir src\components\ui
mkdir src\lib

:: Create app files
echo Creating app files...
(
echo import './globals.css'
echo import type { Metadata } from 'next'
echo import { Inter } from 'next/font/google'
echo.
echo const inter = Inter({ subsets: ['latin', 'arabic'] })
echo.
echo export const metadata: Metadata = {
echo   title: 'Webhook Dashboard',
echo   description: 'لوحة تحكم لعرض وإدارة رسائل Webhook',
echo }
echo.
echo export default function RootLayout({
echo   children,
echo }: {
echo   children: React.ReactNode
echo }) {
echo   return ^(
echo     ^<html lang="ar" dir="rtl"^>
echo       ^<body className={inter.className}^>{children}^</body^>
echo     ^</html^>
echo   ^)
echo }
) > src\app\layout.tsx

:: Create components
echo Creating components...
(
echo import { WebhookMessage } from '@/lib/types'
echo import { Bell, CheckCircle, AlertCircle, Info } from 'lucide-react'
echo.
echo interface MessageItemProps {
echo   message: WebhookMessage
echo }
echo.
echo export default function MessageItem({ message }: MessageItemProps) {
echo   const getIcon = (type: string^) => {
echo     const iconProps = { className: "h-5 w-5" }
echo     switch (type^) {
echo       case 'success': return ^<CheckCircle {...iconProps} className="text-green-500" /^>
echo       case 'error': return ^<AlertCircle {...iconProps} className="text-red-500" /^>
echo       case 'info': return ^<Info {...iconProps} className="text-blue-500" /^>
echo       default: return ^<Bell {...iconProps} /^>
echo     }
echo   }
echo   // ... rest of the MessageItem component
echo }
) > src\components\MessageItem.tsx

:: Create lib files
echo Creating lib files...
(
echo import { createClient } from '@supabase/supabase-js'
echo.
echo const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
echo const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
echo.
echo export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
echo   auth: {
echo     persistSession: false
echo   }
echo })
) > src\lib\supabase.ts

(
echo export type WebhookMessage = {
echo   id: string;
echo   type: 'success' | 'error' | 'info' | 'warning';
echo   title: string;
echo   message: string;
echo   metadata: Record^<string, any^>;
echo   created_at: string;
echo };
) > src\lib\types.ts

:: Create API route
echo Creating API route...
(
echo import { NextResponse } from 'next/server'
echo import { supabase } from '@/lib/supabase'
echo import crypto from 'crypto'
echo.
echo export async function POST(req: Request^) {
echo   try {
echo     const signature = req.headers.get('x-webhook-signature'^)
echo     const body = await req.text(^)
echo     
echo     if (!verifySignature(body, signature^)^) {
echo       return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
echo     }
echo.
echo     const data = JSON.parse(body^)
echo     
echo     const { data: message, error } = await supabase
echo       .from('webhook_messages'^)
echo       .insert([{
echo         type: data.type || 'info',
echo         title: data.title,
echo         message: data.message,
echo         metadata: data.metadata || {}
echo       }]^)
echo       .select(^)
echo       .single(^)
echo.
echo     if (error^) throw error
echo.
echo     return NextResponse.json(message^)
echo   } catch (error^) {
echo     console.error('Webhook error:', error^)
echo     return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
echo   }
echo }
) > src\app\api\webhook\route.ts

:: Create .env.local template
echo Creating .env template...
(
echo NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
echo NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
) > .env.local.template

:: Create global CSS
echo Creating global CSS...
(
echo @tailwind base;
echo @tailwind components;
echo @tailwind utilities;
) > src\app\globals.css

:: Install required packages
echo Installing required packages...
call npm install @supabase/supabase-js lucide-react class-variance-authority clsx tailwind-merge tailwindcss-animate @radix-ui/react-alert-dialog

:: Initialize shadcn-ui
echo Initializing shadcn-ui...
call npx shadcn-ui@latest init -y

:: Add required shadcn-ui components
echo Adding shadcn-ui components...
call npx shadcn-ui@latest add alert-dialog
call npx shadcn-ui@latest add card
call npx shadcn-ui@latest add button

echo Setup complete! Please:
echo 1. Copy .env.local.template to .env.local and update the values
echo 2. Run 'npm run dev' to start the development server

pause