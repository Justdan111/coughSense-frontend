"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"

export function LandingHero() {
  const { user } = useAuth() // get auth state

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
            Clinical-Grade Cough Analysis <span className="text-brand-teal">Powered by AI</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base sm:text-lg md:text-xl text-slate-600 mb-8 sm:mb-10 max-w-2xl mx-auto text-pretty leading-relaxed"
          >
            Monitor your respiratory health with the world&apos;s most advanced acoustic AI. Record your cough and get
            instant, actionable insights.
          </motion.p>
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
              <Link href={user ? "/dashboard" : "/auth/login"}>{user ? "Go to Dashboard" : "Get Started Free"}</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base sm:text-lg h-12 sm:h-14 px-6 sm:px-8 bg-transparent w-full sm:w-auto"
            >
              View Research
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
