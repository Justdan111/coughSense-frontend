import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import { motion } from "framer-motion"

interface StepperProps {
  steps: { id: string; label: string }[]
  currentStep: number
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex items-center w-full px-2 gap-4">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStep
        const isActive = idx === currentStep

        return (
          <div key={step.id} className="flex flex-col items-center flex-1 relative">
            {/* Connected progress line */}
            {idx !== 0 && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: isCompleted || isActive ? '100%' : '100%' }}
                transition={{ duration: 0.4 }}
                className={cn("absolute top-6 -left-1/2 h-1 -z-10 rounded-full", isCompleted ? "bg-ct-primary" : "bg-slate-200")}
              />
            )}

            <motion.div
              layout
              initial={{ scale: 0.9, opacity: 0.8 }}
              animate={{ scale: isActive ? 1.08 : 1, opacity: isCompleted || isActive ? 1 : 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all",
                isCompleted
                  ? "bg-ct-primary border-ct-primary text-white"
                  : isActive
                    ? "border-ct-primary text-ct-primary bg-ct-surface pulse-ring active"
                    : "border-slate-200 text-slate-400 bg-ct-surface",
              )}
            >
              {isCompleted ? <Check className="w-5 h-5" /> : <span className="font-medium">{idx + 1}</span>}
            </motion.div>

            <motion.span
              layout
              className={cn(
                "mt-2 text-xs font-medium hidden sm:block",
                isActive ? "text-ct-primary" : "text-ct-muted",
              )}
            >
              {step.label}
            </motion.span>
          </div>
        )
      })}
    </div>
  )
}
