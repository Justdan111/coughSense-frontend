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
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">User Profile</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">
          Manage your personal information and health preferences.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Full Name</Label>
                  <Input defaultValue="John Doe" className="h-10 sm:h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Email Address</Label>
                  <Input defaultValue="john.doe@example.com" className="h-10 sm:h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Phone Number</Label>
                  <Input defaultValue="+1 (555) 000-0000" className="h-10 sm:h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Date of Birth</Label>
                  <Input type="date" defaultValue="1990-01-01" className="h-10 sm:h-11" />
                </div>
              </div>
              <Button className="bg-brand-teal hover:bg-brand-teal/90 w-full sm:w-auto h-10 sm:h-11">
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Health Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <p className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wider">Blood Type</p>
                <p className="text-base sm:text-lg font-bold text-slate-900">O Positive</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                <p className="text-xs sm:text-sm font-medium text-slate-500 uppercase tracking-wider">Conditions</p>
                <p className="text-base sm:text-lg font-bold text-slate-900">Mild Asthma</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
