"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"

export default function ProfilePage() {
  return (
    <div className="space-y-6 md:space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Account Settings</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">
          Manage your email and password.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-2xl"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 md:space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Email Address</Label>
                <Input defaultValue="john.doe@example.com" className="h-10 sm:h-11" type="email" />
              </div>
            </div>
            <div className="pt-4 border-t">
              <h3 className="text-sm font-medium mb-4">Change Password</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Current Password</Label>
                  <Input type="password" className="h-10 sm:h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">New Password</Label>
                  <Input type="password" className="h-10 sm:h-11" />
                </div>
              </div>
            </div>
            <Button className="bg-brand-teal hover:bg-brand-teal/90 w-full sm:w-auto h-10 sm:h-11">
              Save Changes
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
