"use client"

import { Mic, BarChart3, Stethoscope } from "lucide-react"
import { motion } from "framer-motion"

const steps = [
  {
    title: "Record Audio",
    description: "Simply record a 5-second cough sample using your phone or computer's microphone.",
    icon: Mic,
  },
  {
    title: "AI Processing",
    description: "Our acoustic AI models analyze thousands of features to identify respiratory patterns.",
    icon: BarChart3,
  },
  {
    title: "Get Triage",
    description: "Receive immediate clinical guidance and next-step care recommendations.",
    icon: Stethoscope,
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-slate-50 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">How it Works</h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Our technology uses deep learning to transform acoustic signals into clinical insights.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100"
            >
              <div className="w-12 h-12 bg-brand-teal/10 rounded-xl flex items-center justify-center mb-4 md:mb-6">
                <step.icon className="w-6 h-6 text-brand-teal" />
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">{step.title}</h3>
              <p className="text-slate-600 leading-relaxed text-sm md:text-base">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
