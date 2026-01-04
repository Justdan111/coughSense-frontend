"use client"

import { ProtectedRoute } from "@/components/protected-route"
import { CoughAnalysisComponent } from "@/components/cough-analysis"
import { type AnalysisResponse } from "@/lib/api"

export default function AnalysisPage() {
  const handleAnalysisComplete = (analysis: AnalysisResponse) => {
    // Store in localStorage for history
    const history = JSON.parse(localStorage.getItem("analysis_history") || "[]")
    history.unshift({
      ...analysis,
      timestamp: new Date().toISOString(),
    })
    // Keep only last 10
    localStorage.setItem("analysis_history", JSON.stringify(history.slice(0, 10)))
  }

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Cough Analysis</h1>
          <p className="text-slate-500">Upload or record your cough for AI-powered respiratory health analysis.</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800 text-center">
            <strong>⚠️ Disclaimer:</strong> This tool provides triage-level insights, not medical diagnosis. Always consult a healthcare professional for medical advice.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <CoughAnalysisComponent onAnalysisComplete={handleAnalysisComplete} />
        </div>
      </div>
    </ProtectedRoute>
  )
}

