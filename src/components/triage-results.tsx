"use client"

import { AlertTriangle, RefreshCcw, Share2, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useEffect } from "react"
import { motion } from "framer-motion"

export function TriageResults({ onReset }: { onReset: () => void }) {
  const probability = 68
  const severity = "Moderate"
  const condition = "Potential Acute Bronchitis"

  useEffect(() => {
    const saved = localStorage.getItem("cough_triage_history")
    let history = []
    if (saved) {
      try {
        history = JSON.parse(saved)
      } catch (e) {}
    }

    const newAssessment = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      condition,
      severity,
      confidence: probability,
    }

    // Keep only last 10 for performance in this demo
    const updatedHistory = [newAssessment, ...history].slice(0, 10)
    localStorage.setItem("cough_triage_history", JSON.stringify(updatedHistory))
  }, [condition, severity, probability])

  return (
    <div className="space-y-6 md:space-y-8 py-2 md:py-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center space-y-3 md:space-y-4 px-4"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-50 text-amber-500 mb-2">
          <AlertTriangle className="w-8 h-8 sm:w-10 sm:h-10" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-center gap-2">
            <Badge
              variant="outline"
              className="bg-amber-50 text-amber-700 border-amber-200 uppercase tracking-wider text-xs sm:text-sm"
            >
              {severity} Risk
            </Badge>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{condition}</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            Based on your acoustic sample and symptoms, our AI suggests a moderate risk.
          </p>
        </div>
      </motion.div>

      <div className="space-y-4 md:space-y-6 px-4 sm:px-0">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <div className="flex justify-between text-xs font-medium text-slate-500 px-1">
            <span>AI Confidence Score</span>
            <span>{probability}%</span>
          </div>
          <Progress value={probability} className="h-2 bg-slate-100" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 md:p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 md:space-y-4"
        >
          <h3 className="text-sm sm:text-base font-semibold text-slate-900 flex items-center gap-2">
            <Info className="w-4 h-4 text-brand-teal" />
            Recommended Next Steps
          </h3>
          <ul className="space-y-2 md:space-y-3">
            {[
              "Rest and stay hydrated",
              "Schedule a non-urgent telehealth appointment",
              "Monitor for shortness of breath or high fever (>102°F)",
              "Isolate from others if you suspect a viral infection",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-teal shrink-0" />
                {step}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-4"
        >
          <p className="text-xs sm:text-sm text-amber-800">
            <strong>⚠️ Important:</strong> This is a triage-level assessment, not a medical diagnosis. Please consult a healthcare professional for proper medical advice.
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="pt-2 md:pt-4 flex flex-col gap-3 px-4 sm:px-0"
      >
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={onReset}
            className="flex-1 text-slate-600 border-slate-200 hover:bg-slate-50 text-sm sm:text-base h-11 sm:h-auto"
          >
            <RefreshCcw className="w-4 h-4 mr-2" /> New Assessment
          </Button>
          <Button variant="outline" className="text-slate-600 border-slate-200 hover:bg-slate-50 px-3 h-11 sm:h-auto">
            <Share2 className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
