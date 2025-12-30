"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { AudioRecorder } from "@/components/audio-recorder"
import { SymptomsForm } from "@/components/symptoms-form"
import { AnalysisLoading } from "@/components/analysis-loading"
import { TriageResults } from "@/components/triage-results"

import { motion, AnimatePresence } from "framer-motion"
import { Stepper } from "./ui/stepper"

export type TriageStep = "audio" | "symptoms" | "analyzing" | "results"

export interface SymptomsData {
  [key: string]: string | boolean | number
}

export function TriageFlow() {
  const [step, setStep] = useState<TriageStep>("audio")
  const [audioData, setAudioData] = useState<Blob | null>(null)
  const [symptoms, setSymptoms] = useState<SymptomsData | null>(null)

  const steps = [
    { id: "audio", label: "Audio Sample" },
    { id: "symptoms", label: "Symptoms" },
    { id: "analyzing", label: "AI Analysis" },
    { id: "results", label: "Results" },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === step)

  const handleAudioComplete = (blob: Blob) => {
    setAudioData(blob)
    setStep("symptoms")
  }

  const handleSymptomsComplete = (data: SymptomsData) => {
    setSymptoms(data)
    setStep("analyzing")
    // Simulation: transition to results after 3 seconds
    setTimeout(() => setStep("results"), 3500)
  }

  const stepVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  }

  return (
    <div className="max-w-2xl mx-auto w-full space-y-6 md:space-y-8">
      <Stepper steps={steps} currentStep={currentStepIndex} />

      <Card className="p-4 sm:p-6 md:p-8 border-none shadow-xl bg-white min-h-112.5 sm:min-h-125 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {step === "audio" && (
            <motion.div
              key="audio"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <AudioRecorder onComplete={handleAudioComplete} />
            </motion.div>
          )}

          {step === "symptoms" && (
            <motion.div
              key="symptoms"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <SymptomsForm onComplete={handleSymptomsComplete as (data: Record<string, unknown>) => void} />
            </motion.div>
          )}

          {step === "analyzing" && (
            <motion.div
              key="analyzing"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <AnalysisLoading />
            </motion.div>
          )}

          {step === "results" && (
            <motion.div
              key="results"
              variants={stepVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              <TriageResults
                onReset={() => {
                  setStep("audio")
                  setAudioData(null)
                  setSymptoms(null)
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      <div className="text-center text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed px-4">
        Disclaimer: This tool is for informational purposes only and is not a substitute for professional medical
        advice, diagnosis, or treatment. Always seek the advice of your physician.
      </div>
    </div>
  )
}
