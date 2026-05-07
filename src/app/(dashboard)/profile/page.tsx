"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/hooks/use-auth"
import { useState, useEffect } from "react"
import { authService } from "@/lib/api"

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [nameInput, setNameInput] = useState<string>("")
  const [saveLoading, setSaveLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [consent, setConsent] = useState<boolean>(() => {
    try {
      return localStorage.getItem("consent") === "true"
    } catch (e) {
      return false
    }
  })
  const [displayName, setDisplayName] = useState<string | null>(user?.name ?? null)

  useEffect(() => {
    let mounted = true
    const loadAccount = async () => {
      try {
        const account = await authService.getAccount()
        if (!mounted) return
        setNameInput(account.name || "")
        setDisplayName(account.name || null)
      } catch (err) {
        // fallback to context user
        setNameInput(user?.name || "")
        setDisplayName(user?.name || null)
      }
    }

    loadAccount()
    return () => {
      mounted = false
    }
  }, [user])

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out?")) {
      setIsLoading(true)
      logout()
    }
  }

  const handleSaveName = async () => {
    setSaveLoading(true)
    setSaveMessage(null)
    try {
      const res = await authService.patchAccount({ name: nameInput })
      // Update localStorage cached user if present
      try {
        const stored = localStorage.getItem("cough_triage_user")
        if (stored) {
          const parsed = JSON.parse(stored)
          parsed.name = res.name
          localStorage.setItem("cough_triage_user", JSON.stringify(parsed))
        }
      } catch {}
      setDisplayName(res.name || nameInput)
      setSaveMessage("Name saved")
    } catch (err: any) {
      setSaveMessage(err?.message || "Failed to save name")
    } finally {
      setSaveLoading(false)
      setTimeout(() => setSaveMessage(null), 2500)
    }
  }

  const handleToggleConsent = (value: boolean) => {
    try {
      localStorage.setItem("consent", value ? "true" : "false")
    } catch (e) {
      console.error("Failed to save consent to localStorage", e)
    }
    setConsent(value)
  }

  return (
    <ProtectedRoute>
      <div className="space-y-6 md:space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-bold text-ct">Account Settings</h1>
          <p className="text-sm sm:text-base text-ct-muted mt-1">Manage your clinical profile, security protocols, and HIPAA preferences.</p>
        </motion.div>

        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl"
        >
          <Card className="bg-ct-surface shadow-ct rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl text-ct">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-ct-muted">Your Name</Label>
                <div className="flex gap-3">
                  <input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Your name"
                    className="px-3 py-2 bg-ct-glass rounded-md text-sm w-full border border-slate-100"
                  />
                  <Button onClick={handleSaveName} disabled={saveLoading} className="h-10 sm:h-11">
                    {saveLoading ? "Saving..." : "Save Name"}
                  </Button>
                </div>
                {saveMessage && <p className="text-sm text-ct-primary mt-1">{saveMessage}</p>}
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-ct-muted">Email Address</Label>
                <p className="px-3 py-2 bg-ct-glass rounded-md text-sm font-medium text-ct">{user?.email}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-ct-muted">User ID</Label>
                <p className="px-3 py-2 bg-ct-glass rounded-md text-xs font-medium font-mono text-ct">{user?.id}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Data & Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="max-w-2xl"
        >
          <Card className="bg-ct-surface shadow-ct rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl text-ct">Data & Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-ct-muted">
                  Allow anonymized cough recordings to improve the CoughSense AI model.
                </p>
                <p className="text-xs text-ct-muted mt-2">
                  No personal information is attached to recordings. You can change this at any time.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Send anonymized recordings</Label>
                </div>
                <div>
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => handleToggleConsent(e.target.checked)}
                    className="h-5 w-5"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Logout Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl"
        >
          <Card className="bg-ct-surface shadow-ct rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl text-ct">Session</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-ct-muted mb-4">Sign out from your account to end your current session.</p>
              <Button onClick={handleLogout} variant="destructive" disabled={isLoading} className="h-10 sm:h-11 bg-risk-high text-white hover:opacity-95">
                {isLoading ? "Signing out..." : "Sign Out"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Message */}
        <div className="bg-ct-glass rounded-lg p-4 max-w-2xl shadow-ct">
          <p className="text-sm text-ct-muted">
            <strong>💡 Note:</strong> To change your email or password, please contact our support team or use the password reset option.
          </p>
        </div>
      </div>
    </ProtectedRoute>
  )
}
