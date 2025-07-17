import React from "react"
import "./footer.css"
import { Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

function Footer() {
  return (
    <footer className="py-16 px-6 bg-gray-900 dark:bg-slate-950 text-white">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative">
                <Image
                  src="/logo/Spark Logo.png"
                  width={40}
                  height={30}
                  alt="Spark logo"
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent">
                SPARK
              </span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Empowering Pakistan's tech future through collaboration,
              mentorship, and innovation. Building bridges between academia and
              industry.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-6 text-lg">Platform</h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Communities
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Mentorship
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Projects
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Events
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-6 text-lg">Resources</h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  API
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-6 text-lg">Connect</h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Support
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>
            &copy; 2024 SPARK Platform. All rights reserved. Built with ❤️ for
            Pakistan's tech community.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
