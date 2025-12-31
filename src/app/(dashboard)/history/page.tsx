"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronRight, Clock } from "lucide-react"
import { motion } from "framer-motion"

interface HistoryItem {
  date: string
  confidence: number
  severity: "High" | "Moderate" | "Low"
}

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem("cough_triage_history")
    return saved ? JSON.parse(saved).reverse() : []
  })

  return (
    <div className="space-y-6 md:space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Assessment History</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">Review your past cough analysis results.</p>
      </motion.div>

      <div className="grid gap-3 md:gap-4">
        {history.length > 0 ? (
          history.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:border-brand-teal transition-colors cursor-pointer group">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3 sm:gap-6 flex-1">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 rounded-xl flex flex-col items-center justify-center text-slate-500 shrink-0">
                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base text-slate-900">Cough Analysis</h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm text-slate-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(item.date).toLocaleDateString()}
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span>Confidence: {item.confidence}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                      <Badge
                        className={`text-xs ${
                          item.severity === "High"
                            ? "bg-red-100 text-red-700 border-red-200"
                            : item.severity === "Moderate"
                              ? "bg-amber-100 text-amber-700 border-amber-200"
                              : "bg-green-100 text-green-700 border-green-200"
                        }`}
                      >
                        {item.severity} Risk
                      </Badge>
                      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand-teal transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-8 sm:p-12 text-center">
              <p className="text-sm sm:text-base text-slate-500">No assessments found yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
