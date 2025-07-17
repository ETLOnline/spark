import type { Metadata } from "next"
import { Inter, Fira_Code, Source_Code_Pro } from "next/font/google"
import "./globals.css"
import { ClerkProvider } from "@clerk/nextjs"
import ThemeProvider from "../components/ThemeProvider/ThemeProvider"
import { Toaster } from "../components/ui/toaster"
import { dark } from "@clerk/themes"
import AuthInitializer from "../services/auth/AuthInitializer"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter"
})

const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--font-fira-code"
})

const sourceCodePro = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-source-code-pro"
})

export const metadata: Metadata = {
  title: "Spark",
  description: "Community Platform"
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider appearance={{ baseTheme: dark }}>
      <AuthInitializer />
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${inter.variable} ${firaCode.variable} ${sourceCodePro.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Toaster />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
