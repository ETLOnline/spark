import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import ThemeProvider from "../components/ThemeProvider/ThemeProvider"
import { Toaster } from "../components/ui/toaster"
import { dark } from "@clerk/themes"
import AuthInitializer from "../services/auth/AuthInitializer"
import { ScreenOverlayProvider } from "../hooks/useScreenOverlay"
import NotificationProvider from "../services/notifications/NotificationProvider"
import { Suspense } from "react"
import ReferralHandler from "../components/common/GetReferral"
import RewardNotification from "../components/common/rewards/RewardNotification"
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900"
})
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900"
})

export const metadata: Metadata = {
  title: "Spark",
  description: "Community Platform"
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <AuthInitializer />
      <Suspense>
        <ReferralHandler />
      </Suspense>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster />
            <RewardNotification />
            <Suspense>
              <NotificationProvider />
            </Suspense>
            <ScreenOverlayProvider>{children}</ScreenOverlayProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
