"use client"

import { Menu, X, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, logout } = useAuth() // added logout

  return (
    <header className="sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between bg-ct-glass border border-transparent shadow-ct rounded-b-2xl">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-[color:var(--color-primary)] to-[color:var(--color-secondary)] text-white shadow-ct">
            <svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M1 10C4 6 7 6 10 10C13 14 16 14 19 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-semibold text-lg tracking-tight text-ct">CoughTriage</span>
        </Link>

        {/* Desktop navigation with improved spacing and conditional auth links */}
        <nav className="hidden md:flex items-center gap-6">
          <a href="/" className="text-sm font-medium text-ct-muted hover:text-ct transition-colors">Audio Sample</a>
          <a href="/" className="text-sm font-medium text-ct-muted hover:text-ct transition-colors">AI Analysis</a>
          <a href="/results" className="text-sm font-medium text-ct-muted hover:text-ct transition-colors">Results</a>
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-ct-surface px-3 py-1 rounded-full border border-transparent shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[color:var(--color-accent)] block" />
                <span className="text-xs text-ct-muted">AI System Online</span>
              </div>
              <button className="p-2 rounded-md hover:bg-slate-50 transition">
                <Bell className="w-5 h-5 text-ct-muted" />
              </button>
              <div className="w-9 h-9 rounded-full bg-ct-primary flex items-center justify-center text-white text-sm">{user?.name?.charAt(0) ?? 'U'}</div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-ct-muted hover:text-ct">Log in</Link>
              <Button size="sm" className="bg-ct-primary hover:opacity-95 text-white" asChild>
                <Link href="/login">Get Started</Link>
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile menu toggle button */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Mobile menu dropdown with Framer Motion and conditional auth links */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t bg-white overflow-hidden"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <a
                href="#how-it-works"
                className="text-base font-medium text-ct-muted hover:text-ct transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                How it works
              </a>
              <a
                href="#features"
                className="text-base font-medium text-ct-muted hover:text-ct transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              {user ? (
                <>
                  <Button
                    className="w-full justify-start"
                    variant="ghost"
                    asChild
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/dashboard">Dashboard</Link>
                  </Button>
                  <Button
                    className="w-full bg-transparent"
                    variant="outline"
                    onClick={() => {
                      logout()
                      setMobileMenuOpen(false)
                    }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button
                    className="bg-ct-primary hover:opacity-95 w-full mt-2 text-white"
                    asChild
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/login">Get Started</Link>
                  </Button>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
