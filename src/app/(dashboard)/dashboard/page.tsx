"use client"

import { CoughAnalysisComponent } from "@/components/cough-analysis"
import { useAuth } from "@/hooks/use-auth"

export default function DashboardHome() {
  const { user } = useAuth()

  return (
    <div className="space-y-6 py-4">
      <div className="text-center">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Welcome, {user?.name || "User"}</h1>
        <p className="text-slate-500 mt-1">Analyze your cough for respiratory health insights.</p>
      </div>

      <CoughAnalysisComponent />
    </div>
  )
}
