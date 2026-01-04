"use client"

import { CoughAnalysisComponent } from "@/components/cough-analysis"
import { ProtectedRoute } from "@/components/protected-route"
import { TriageFlow } from "@/components/triage-flow"
import { useAuth } from "@/hooks/use-auth"

export default function DashboardHome() {
  const { user } = useAuth()

  return (
    <ProtectedRoute>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome, {user?.name || "User"}</h1>
          <p className="text-slate-500">Analyze your cough for respiratory health insights.</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800 text-center">
            <strong>⚠️ Disclaimer:</strong> This tool provides triage-level insights, not medical diagnosis. Always consult a healthcare professional for medical advice.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <CoughAnalysisComponent/>
        </div>
      </div>
    </ProtectedRoute>
  )
}
