"use client"

import { Shield, Zap, Globe, Lock } from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    title: "Risk Assessment",
    description: "AI analyzes your cough to estimate respiratory risk level: Low, Moderate, or High.",
    icon: Shield,
  },
  {
    title: "Instant Analysis",
    description: "Get results in seconds with confidence scores between 60-75%.",
    icon: Zap,
  },
  {
    title: "Privacy First",
    description: "Your audio data is encrypted and processed securely.",
    icon: Lock,
  },
  {
    title: "Track History",
    description: "View your past assessments and monitor changes over time.",
    icon: Globe,
  },
]

export function Features() {
  return (
    <section id="features" className="py-16 md:py-24 bg-white px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">Key Features</h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Simple, fast triage assessment powered by machine learning.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-6 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-xl hover:shadow-brand-teal/5 transition-all"
            >
              <div className="w-10 h-10 bg-brand-teal rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-brand-teal/20">
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base md:text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
