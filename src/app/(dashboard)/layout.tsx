"use client"

import type React from "react"
import { Activity, Home, History, User, LogOut, Menu } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

const navItems = [
  { icon: Home, label: "Analyze", href: "/dashboard" },
  { icon: History, label: "History", href: "/history" },
  { icon: User, label: "Account", href: "/profile" },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-ct-primary/5">
        <Loader2 className="w-8 h-8 animate-spin text-ct-primary" />
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-ct-primary/5 overflow-hidden">
      <div className="lg:hidden flex items-center justify-between px-4 h-16 bg-ct-glass border-b border-slate-100 sticky top-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-ct-primary text-white shadow-ct">
            <svg width="18" height="14" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M1 10C4 6 7 6 10 10C13 14 16 14 19 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="font-semibold text-lg tracking-tight text-ct">CoughTriage</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          data-testid="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <Menu className="w-6 h-6" />
        </Button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              data-testid="mobile-sidebar"
              className="fixed left-0 top-0 bottom-0 w-60 bg-ct-glass border-r border-slate-100 z-50 lg:hidden flex flex-col"
            >
              <div className="p-6 flex items-center gap-3 border-b">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-ct-primary text-white shadow-ct">
                  <svg width="20" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M1 10C4 6 7 6 10 10C13 14 16 14 19 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-lg tracking-tight text-ct">CoughTriage</div>
                  <div className="text-xs text-ct-muted">AI System Online</div>
                </div>
              </div>

              <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      data-testid={`mobile-nav-${item.label.toLowerCase()}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all group relative",
                        isActive
                          ? "bg-ct-primary text-white shadow-lg"
                          : "text-ct-muted hover:bg-ct-surface",
                      )}
                    >
                      <item.icon
                        className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-ct-primary")}
                      />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>

              <div className="p-6 border-t">
                <Button
                  variant="ghost"
                  data-testid="mobile-nav-logout"
                  className="w-full justify-start gap-3 text-slate-600 hover:text-red-500 hover:bg-red-50"
                  onClick={logout}
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        data-testid="sidebar"
        className="w-60 bg-ct-glass border-r border-slate-100 hidden lg:flex flex-col relative z-20"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-ct-primary text-white shadow-ct">
            <svg width="20" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M1 10C4 6 7 6 10 10C13 14 16 14 19 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div className="font-semibold text-lg tracking-tight text-ct">CoughTriage</div>
            <div className="text-xs text-ct-muted">AI System Online</div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                data-testid={`nav-${item.label.toLowerCase()}`}
                data-active={isActive ? "true" : "false"}
                className={cn(
                  "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all group relative",
                  isActive
                    ? "bg-ct-primary text-white shadow-lg"
                    : "text-ct-muted hover:bg-ct-surface",
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-ct-primary")} />
                {item.label}
                {isActive && (
                  <motion.div layoutId="active-pill" className="absolute left-0 w-1 h-8 bg-ct-surface/0 rounded-r-full" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-6 border-t">
          <Button
            variant="ghost"
            data-testid="nav-logout"
            className="w-full justify-start gap-3 text-slate-600 hover:text-red-500 hover:bg-red-50"
            onClick={logout}
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
        </div>
      </motion.aside>

      <main className="flex-1 relative overflow-y-auto outline-none">
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  )
}
