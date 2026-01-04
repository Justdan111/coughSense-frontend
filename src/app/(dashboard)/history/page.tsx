"use client"

import { useState, useEffect } from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Trash2, AlertTriangle, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import type { AnalysisResponse } from "@/lib/api"

interface AnalysisWithTimestamp extends AnalysisResponse {
  timestamp: string
}

export default function HistoryPage() {
  const [history, setHistory] = useState<AnalysisWithTimestamp[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load history from localStorage on mount (client-side only)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("analysis_history")
      if (saved) {
        const parsed = JSON.parse(saved)
        setHistory(parsed)
      }
    } catch (error) {
      console.error("Failed to load history", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear your entire analysis history?")) {
      localStorage.removeItem("analysis_history")
      setHistory([])
    }
  }

  const handleDeleteItem = (index: number) => {
    const newHistory = history.filter((_, i) => i !== index)
    setHistory(newHistory)
    localStorage.setItem("analysis_history", JSON.stringify(newHistory))
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return "bg-green-100 text-green-700 border-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "high":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return <CheckCircle className="w-4 h-4" />
      case "medium":
        return <AlertTriangle className="w-4 h-4" />
      case "high":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">Loading...</p>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6 md:space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Analysis History</h1>
              <p className="text-sm sm:text-base text-slate-500 mt-1">
                View your last {history.length} cough analysis results.
              </p>
            </div>
            {history.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearHistory}
                className="self-start sm:self-auto"
              >
                Clear History
              </Button>
            )}
          </div>
        </motion.div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-xs sm:text-sm text-amber-800 text-center">
            <strong>⚠️ Reminder:</strong> These are triage-level assessments, not medical diagnoses.
          </p>
        </div>

        <div className="grid gap-3 md:gap-4">
          {history.length > 0 ? (
            history.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:border-primary transition-colors">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-start sm:items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                          <Calendar className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base text-slate-900 truncate">
                            {item.summary}
                          </h3>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs sm:text-sm text-slate-500 mt-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(item.timestamp).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span>
                              {new Date(item.timestamp).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            <span className="hidden sm:inline">•</span>
                            <span className="text-slate-600 font-medium">
                              Confidence: {item.confidence.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                        <Badge
                          className={`text-xs whitespace-nowrap flex items-center gap-1 ${getRiskColor(
                            item.risk_level
                          )}`}
                        >
                          {getRiskIcon(item.risk_level)}
                          {item.risk_level.charAt(0).toUpperCase() + item.risk_level.slice(1)}
                        </Badge>
                        <button
                          onClick={() => handleDeleteItem(index)}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50"
                          title="Delete this analysis"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-8 sm:p-12 text-center">
                <div className="space-y-3">
                  <p className="text-sm sm:text-base text-slate-500">
                    No analysis history yet.
                  </p>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Start by analyzing your cough to see results here.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
