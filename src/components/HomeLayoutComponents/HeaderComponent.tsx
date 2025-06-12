'use client'
import React, { Suspense } from "react"
import "./header.css"
import { LinkAsButton } from "@/src/components/LinkAsButton/LinkAsButton"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import ModeToggle from "../ThemeProvider/ThemeToggle"
import { motion } from "framer-motion"
import Image from "next/image"
import { Sparkles } from "lucide-react"
import Link from "next/link"


function Header() {
  return (
    <Suspense>
      <motion.nav
        className="fixed top-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl z-50  dark:border-slate-700 shadow-lg"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3" >

              <div className="relative">
                <Image src='/logo/spark-logo-animated.gif' width={40} height={30} alt='Spark logo' />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                SPARK
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link
                href="#community"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                Community
              </Link>
              <Link
                href="#enterprise"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                Enterprise
              </Link>
              <Link
                href="#architecture"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                Architecture
              </Link>
              <Link
                href="#features"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                Features
              </Link>
              <Link
                href="#roadmap"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                Roadmap
              </Link>
              <Link
                href="#testimonials"
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
              >
                Success Stories
              </Link>
              <div className="flex items-center space-x-4">
                <ModeToggle />
                <SignedIn>
                  <UserButton userProfileUrl="/profile" />
                </SignedIn>
                <SignedOut>
                  {/* <LinkAsButton href="/sign-in" variant={"default"}>
                    Log In
                  </LinkAsButton> */}
                  <LinkAsButton href="/sign-up" className="bg-gradient-to-r from-blue-600 via-orange-600 to-red-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg">
                    Join SPARK
                    <Sparkles className="ml-2 w-4 h-4" />
                  </LinkAsButton>
                </SignedOut>
              </div>
            </div>
          </div>
        </div>
      </motion.nav>
    </Suspense>
  )
}

export default Header
