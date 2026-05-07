"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/hooks/use-auth"
import { useState } from "react"

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out?")) {
      setIsLoading(true)
      logout()
    }
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
                <Label className="text-sm text-ct-muted">Name</Label>
                <p className="px-3 py-2 bg-ct-glass rounded-md text-sm font-medium text-ct">{user?.name || "Not provided"}</p>
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
