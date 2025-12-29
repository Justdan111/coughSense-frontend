"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { motion } from "framer-motion"

export function SymptomsForm({ onComplete }: { onComplete: (data: any) => void }) {
  const symptoms = [
    "Fever",
    "Shortness of breath",
    "Sore throat",
    "Runny nose",
    "Chest pain",
    "Fatigue",
    "Loss of taste/smell",
    "Muscle aches",
  ]

  return (
    <div className="space-y-6 md:space-y-8 py-2 md:py-4">
      <div className="text-center space-y-2 px-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">Any other symptoms?</h2>
        <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
          Select any additional symptoms you are currently experiencing.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 px-4 sm:px-0">
        {symptoms.map((symptom, idx) => (
          <motion.div
            key={symptom}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-center space-x-3 p-3 md:p-4 border rounded-xl hover:border-brand-teal hover:bg-brand-soft/50 transition-all cursor-pointer group"
          >
            <Checkbox
              id={symptom}
              className="border-slate-300 data-[state=checked]:bg-brand-teal data-[state=checked]:border-brand-teal"
            />
            <Label
              htmlFor={symptom}
              className="text-sm sm:text-base font-medium text-slate-700 cursor-pointer flex-1 group-hover:text-slate-900"
            >
              {symptom}
            </Label>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-4 px-4 sm:px-0">
        <Button
          variant="outline"
          className="flex-1 h-12 sm:h-11 md:py-6 bg-transparent text-sm sm:text-base"
          onClick={() => onComplete({})}
        >
          Skip for now
        </Button>
        <Button
          className="flex-1 h-12 sm:h-11 md:py-6 bg-brand-teal hover:bg-brand-teal/90 text-sm sm:text-base"
          onClick={() => onComplete({ hasSymptoms: true })}
        >
          Continue to Analysis
        </Button>
      </div>
    </div>
  )
}
