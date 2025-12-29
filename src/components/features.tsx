"use client"

import { Shield, Zap, Globe, Lock } from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    title: "Clinical Accuracy",
    description: "Developed in collaboration with leading respiratory health institutions and clinicians.",
    icon: Shield,
  },
  {
    title: "Instant Results",
    description: "Get real-time feedback on your respiratory health in less than 30 seconds.",
    icon: Zap,
  },
  {
    title: "Privacy First",
    description: "Your audio data is encrypted and never stored without your explicit consent.",
    icon: Lock,
  },
  {
    title: "Global Reach",
    description: "Accessible anywhere in the world, helping bridge the gap in respiratory triage.",
    icon: Globe,
  },
]

export function Features() {
  return (
    <section id="features" className="py-16 md:py-24 bg-white px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">Why CoughSense?</h2>
          <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
            Our platform combines cutting-edge acoustic science with clinical expertise.
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
