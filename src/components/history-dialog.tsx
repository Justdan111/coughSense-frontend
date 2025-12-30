"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, AlertTriangle, ChevronRight, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Assessment {
  id: string
  date: string
  condition: string
  severity: string
  confidence: number
}

const getDefaultMockData = (): Assessment[] => [
  {
    id: "1",
    date: new Date(Date.now() - 86400000).toISOString(),
    condition: "Acute Bronchitis",
    severity: "Moderate",
    confidence: 68,
  },
  {
    id: "2",
    date: new Date(Date.now() - 172800000).toISOString(),
    condition: "Common Cold",
    severity: "Low",
    confidence: 82,
  },
]

export function HistoryDialog() {
  const [history, setHistory] = useState<Assessment[]>(() => {
    const saved = localStorage.getItem("cough_triage_history")
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error("[v0] Error parsing history:", e)
        return getDefaultMockData()
      }
    } else {
      const mockData = getDefaultMockData()
      localStorage.setItem("cough_triage_history", JSON.stringify(mockData))
      return mockData
    }
  })

  const clearHistory = () => {
    localStorage.removeItem("cough_triage_history")
    setHistory([])
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-slate-200 bg-transparent">
          History
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Assessment History</DialogTitle>
            {history.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearHistory} className="text-slate-400 hover:text-red-500">
                <Trash2 className="w-4 h-4 mr-1" /> Clear
              </Button>
            )}
          </div>
          <DialogDescription>Review your past cough analysis results and trends.</DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {history.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No assessments recorded yet.</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="group p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-brand-teal transition-all cursor-pointer relative"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <Calendar className="w-3 h-3" />
                    {formatDate(item.date)}
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${item.severity === "Moderate" ? "text-amber-600 border-amber-200 bg-amber-50" : "text-slate-500 border-slate-200 bg-slate-50"}`}
                  >
                    {item.severity} Risk
                  </Badge>
                </div>
                <div className="font-semibold text-slate-900 flex items-center justify-between">
                  <span>{item.condition}</span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-teal transition-colors" />
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <AlertTriangle className="w-3 h-3 text-brand-teal" />
                  <span>{item.confidence}% Confidence Score</span>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
