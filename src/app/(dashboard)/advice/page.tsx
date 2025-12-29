"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HeartPulse, ShieldAlert, Thermometer, Wind } from "lucide-react"
import { motion } from "framer-motion"

const adviceItems = [
  {
    icon: ShieldAlert,
    title: "When to seek immediate care",
    content:
      "If you experience severe difficulty breathing, persistent pain or pressure in the chest, new confusion, or inability to wake or stay awake.",
    color: "text-red-500",
    bg: "bg-red-50",
  },
  {
    icon: Thermometer,
    title: "Managing Symptoms",
    content:
      "Stay hydrated, get plenty of rest, and use a humidifier. Over-the-counter medications may help with cough and fever relief.",
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    icon: Wind,
    title: "Air Quality Tips",
    content: "Avoid smoke, strong odors, and high-pollution areas which can irritate the respiratory system.",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
]

export default function AdvicePage() {
  return (
    <div className="space-y-6 md:space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Medical Advice</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">
          General guidance for respiratory health and symptom management.
        </p>
      </motion.div>

      <div className="grid gap-4 md:gap-6">
        {adviceItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="pb-3 md:pb-4">
                <div className="flex items-start sm:items-center gap-3 md:gap-4">
                  <div className={`p-2 sm:p-3 rounded-xl ${item.bg} shrink-0`}>
                    <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.color}`} />
                  </div>
                  <CardTitle className="text-base sm:text-lg md:text-xl leading-snug">{item.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{item.content}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-brand-teal/5 border border-brand-teal/10 rounded-2xl p-6 sm:p-8 text-center"
      >
        <HeartPulse className="w-10 h-10 sm:w-12 sm:h-12 text-brand-teal mx-auto mb-3 md:mb-4" />
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Note on Self-Assessment</h3>
        <p className="text-xs sm:text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          This tool is for informational purposes only and is not a substitute for professional medical advice,
          diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider.
        </p>
      </motion.div>
    </div>
  )
}
