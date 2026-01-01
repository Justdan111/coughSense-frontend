"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

export function LandingHero() {
  const { user } = useAuth() 

  return (
    <section className="relative overflow-hidden py-12 px-4 sm:py-16 md:py-20 lg:py-32">
      <div className="container relative z-10 mx-auto">
        {/* Mobile-first text sizing and spacing */}
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-4 sm:mb-6 text-balance leading-tight"
          >
            CoughSense
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base sm:text-lg md:text-xl text-slate-600 mb-6 max-w-2xl mx-auto text-pretty leading-relaxed"
          >
            AI-powered cough triage tool for early respiratory risk awareness.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 max-w-2xl mx-auto"
          >
            <p className="text-sm text-amber-800 text-center">
              ⚠️ <strong>Disclaimer:</strong> This tool provides triage-level insights, not medical diagnosis. Always consult a healthcare professional for medical advice.
            </p>
          </motion.div>
          {/* Mobile-optimized button layout with proper touch targets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0"
          >
            <Button
              size="lg"
              asChild
              className="bg-brand-teal hover:bg-brand-teal/90 text-base sm:text-lg h-12 sm:h-14 px-6 sm:px-8 w-full sm:w-auto"
            >
              <Link href={user ? "/dashboard" : "/login"}>{user ? "Go to Dashboard" : "Get Started"}</Link>
            </Button>
            {!user && (
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-base sm:text-lg h-12 sm:h-14 px-6 sm:px-8 bg-transparent w-full sm:w-auto"
              >
                <Link href="/login">Login</Link>
              </Button>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
