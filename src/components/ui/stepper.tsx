import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface StepperProps {
  steps: { id: string; label: string }[]
  currentStep: number
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="flex items-center justify-between w-full px-2">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStep
        const isActive = idx === currentStep

        return (
          <div key={step.id} className="flex flex-col items-center flex-1 relative">
            {/* Progress Line */}
            {idx !== 0 && (
              <div
                className={cn(
                  "absolute top-5 -left-1/2 w-full h-[2px] -z-10",
                  idx <= currentStep ? "bg-brand-teal" : "bg-slate-200",
                )}
              />
            )}

            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                isCompleted
                  ? "bg-brand-teal border-brand-teal text-white"
                  : isActive
                    ? "border-brand-teal text-brand-teal bg-white"
                    : "border-slate-200 text-slate-400 bg-white",
              )}
            >
              {isCompleted ? <Check className="w-5 h-5" /> : <span>{idx + 1}</span>}
            </div>
            <span
              className={cn(
                "mt-2 text-xs font-medium hidden sm:block",
                isActive ? "text-brand-teal" : "text-slate-500",
              )}
            >
              {step.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
