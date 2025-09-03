"use client"
import React, { Suspense, useState } from "react"
import "./header.css"
import { LinkAsButton } from "@/src/components/LinkAsButton/LinkAsButton"
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import ModeToggle from "../ThemeProvider/ThemeToggle"
import { motion } from "framer-motion"
import Image from "next/image"
import { LogIn, Logs, Sparkles } from "lucide-react"
import Link from "next/link"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "../ui/sheet"
import { useRouter } from "next/navigation"

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const menuItems = [
    { title: "Community", href: "#community" },
    { title: "Mentors", href: "#mentors" },
    { title: "Enterprise", href: "#enterprise" },
    { title: "Architecture", href: "#architecture" },
    { title: "Features", href: "#features" },
    { title: "Roadmap", href: "#roadmap" }
  ]

  const router = useRouter()
  return (
    <Suspense>
      <motion.nav
        className="fixed top-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl z-50  dark:border-slate-700 shadow-lg"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-2 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="block lg:hidden">
                <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                  <SheetTrigger
                    className=" hover:cursor-pointer block lg:hidden "
                    asChild
                  >
                    <Logs className="h-8 w-6" />
                  </SheetTrigger>
                  <SheetContent side={"left"} className="w-80">
                    <SheetHeader>
                      <SheetTitle>SPARK</SheetTitle>
                      <div className="flex flex-col space-y-4 mt-4">
                        {menuItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="p-2 w-full text-center hover:bg-primary hover:text-primary-foreground rounded-md font-medium"
                            onClick={() => setIsMenuOpen(false)}
                          >
                            {item.title}
                          </Link>
                        ))}
                      </div>
                    </SheetHeader>
                  </SheetContent>
                </Sheet>
              </div>
              <div className="flex items-center space-x-1">
                <div className="relative">
                  <Image
                    src="/logo/spark-logo-animated-themed.gif"
                    width={40}
                    height={30}
                    alt="Spark logo"
                  />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary via-primary-hover to-foreground bg-clip-text text-transparent">
                  SPARK
                </span>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-6">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-foreground dark:text-foreground hover:text-primary dark:hover:text-primary-hover transition-colors font-medium"
                >
                  {item.title}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="hidden sm:block">
                  <ModeToggle />
                </div>
                <SignedIn>
                  <UserButton userProfileUrl="/profile" />
                </SignedIn>
                <SignedOut>
                  <LinkAsButton href="/sign-in" variant={"outline"}>
                    <span className="hidden sm:inline">Sign In</span>
                    <LogIn className="mr-1 w-4 h-4" />
                  </LinkAsButton>
                  <div className="hidden sm:block">
                    <LinkAsButton
                      href="/sign-up"
                      className="bg-gradient-to-r from-primary to-accent hover:from-primary-hover hover:to-accent-hover text-primary-foreground shadow-lg"
                    >
                      Join SPARK
                      <Sparkles className="ml-2 w-4 h-4" />
                    </LinkAsButton>
                  </div>
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
