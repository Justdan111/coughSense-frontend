"use client"

import type React from "react"
import { Activity, Home, History, User, HeartPulse, LogOut, Menu } from "lucide-react"
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
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: History, label: "History", href: "/history" },
  { icon: HeartPulse, label: "Advice", href: "/advice" },
  { icon: User, label: "Profile", href: "/profile" },
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
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-brand-teal" />
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-slate-50 overflow-hidden">
      <div className="lg:hidden flex items-center justify-between px-4 h-16 bg-white border-b border-slate-200 sticky top-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="bg-brand-teal p-2 rounded-xl">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">CoughTriage</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
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
              className="fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-slate-200 z-50 lg:hidden flex flex-col"
            >
              <div className="p-6 flex items-center gap-3 border-b">
                <div className="bg-brand-teal p-2 rounded-xl">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl tracking-tight">CoughTriage</span>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group relative",
                        isActive
                          ? "bg-brand-teal text-white shadow-lg shadow-brand-teal/20"
                          : "text-slate-600 hover:bg-slate-50",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "w-5 h-5",
                          isActive ? "text-white" : "text-slate-400 group-hover:text-brand-teal",
                        )}
                      />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>

              <div className="p-6 border-t">
                <Button
                  variant="ghost"
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
        className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col relative z-20"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="bg-brand-teal p-2 rounded-xl">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">CoughTriage</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group relative",
                  isActive
                    ? "bg-brand-teal text-white shadow-lg shadow-brand-teal/20"
                    : "text-slate-600 hover:bg-slate-50",
                )}
              >
                <item.icon
                  className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-brand-teal")}
                />
                {item.label}
                {isActive && (
                  <motion.div layoutId="active-pill" className="absolute left-0 w-1 h-8 bg-white rounded-r-full" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-6 border-t">
          <Button
            variant="ghost"
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
