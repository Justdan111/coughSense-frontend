"use client"

import { useEffect, useState } from "react"
import { Search, Brain, Activity, ShieldCheck } from "lucide-react"

export function AnalysisLoading() {
  const [progress, setProgress] = useState(0)
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    { icon: Search, text: "Extracting acoustic features..." },
    { icon: Brain, text: "Running AI neural classification..." },
    { icon: Activity, text: "Correlating with symptom data..." },
    { icon: ShieldCheck, text: "Finalizing triage assessment..." },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 100
        return p + 1
      })
    }, 30)

    const stepInterval = setInterval(() => {
      setActiveStep((s) => (s < steps.length - 1 ? s + 1 : s))
    }, 800)

    return () => {
      clearInterval(interval)
      clearInterval(stepInterval)
    }
  }, [steps.length])

  return (
    <div className="flex flex-col items-center justify-center space-y-12 py-8">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            className="text-slate-100"
            strokeWidth="6"
            stroke="currentColor"
            fill="transparent"
            r="44"
            cx="50"
            cy="50"
          />
          <circle
            className="text-brand-teal transition-all duration-300 ease-out"
            strokeWidth="6"
            strokeDasharray={2 * Math.PI * 44}
            strokeDashoffset={2 * Math.PI * 44 * (1 - progress / 100)}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="44"
            cx="50"
            cy="50"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl font-bold text-slate-900">{progress}%</span>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-6">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-4 transition-all duration-500 ${
              idx === activeStep ? "opacity-100 scale-105" : idx < activeStep ? "opacity-40" : "opacity-20"
            }`}
          >
            <div
              className={`p-2 rounded-lg ${idx === activeStep ? "bg-brand-soft text-brand-teal" : "bg-slate-100 text-slate-400"}`}
            >
              <step.icon className="w-5 h-5" />
            </div>
            <span className="font-medium text-slate-700">{step.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
