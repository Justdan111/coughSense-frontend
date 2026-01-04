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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Account Settings</h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Manage your profile and account preferences.
          </p>
        </motion.div>

        {/* Profile Information */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Name</Label>
                <p className="px-3 py-2 bg-gray-50 rounded-md text-sm font-medium">
                  {user?.name || "Not provided"}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Email Address</Label>
                <p className="px-3 py-2 bg-gray-50 rounded-md text-sm font-medium">
                  {user?.email}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">User ID</Label>
                <p className="px-3 py-2 bg-gray-50 rounded-md text-xs font-medium font-mono">
                  {user?.id}
                </p>
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Session</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Sign out from your account to end your current session.
              </p>
              <Button
                onClick={handleLogout}
                variant="destructive"
                disabled={isLoading}
                className="h-10 sm:h-11"
              >
                {isLoading ? "Signing out..." : "Sign Out"}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Info Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl">
          <p className="text-sm text-blue-800">
            <strong>💡 Note:</strong> To change your email or password, please contact our support team or use the password reset option.
          </p>
        </div>
      </div>
    </ProtectedRoute>
  )
}
