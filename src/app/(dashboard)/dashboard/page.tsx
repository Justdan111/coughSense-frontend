import { TriageFlow } from "@/components/triage-flow"

export default function DashboardHome() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Health Assessment</h1>
        <p className="text-slate-500">Record a new cough sample for AI analysis.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <TriageFlow />
      </div>
    </div>
  )
}
