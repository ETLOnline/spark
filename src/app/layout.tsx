import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import {
  ClerkProvider
} from '@clerk/nextjs'
import ClerkAuthListener from "../services/auth/ClerkAuthListner";
import ThemeProvider from "../components/ThemeProvider/ThemeProvider";
import { Toaster } from "../components/ui/toaster";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Spark",
  description: "Community Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <ClerkAuthListener />
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
            <Toaster/>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
