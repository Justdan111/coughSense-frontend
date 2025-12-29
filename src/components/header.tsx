"use client"

import { Activity, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HistoryDialog } from "@/components/history-dialog"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import Link from "next/link"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-brand-teal p-1.5 rounded-lg">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg md:text-xl tracking-tight text-slate-900">CoughTriage AI</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-brand-teal transition-colors">
            How it works
          </a>
          <a href="#features" className="text-sm font-medium text-slate-600 hover:text-brand-teal transition-colors">
            Features
          </a>
          <a href="#research" className="text-sm font-medium text-slate-600 hover:text-brand-teal transition-colors">
            Research
          </a>
          <Button size="sm" className="bg-brand-teal hover:bg-brand-teal/90" asChild>
            <Link href="/dashboard">Get Started</Link>
          </Button>
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

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
                className="text-base font-medium text-slate-600 hover:text-brand-teal transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                How it works
              </a>
              <a
                href="#features"
                className="text-base font-medium text-slate-600 hover:text-brand-teal transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#research"
                className="text-base font-medium text-slate-600 hover:text-brand-teal transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Research
              </a>
              <Button className="bg-brand-teal hover:bg-brand-teal/90 w-full mt-2" asChild>
                <Link href="/dashboard">Get Started</Link>
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
