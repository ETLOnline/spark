"use client"

import { useState } from "react"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Separator } from "@/src/components/ui/separator"
import { ToastAction } from "@/src/components/ui/toast"
import { Button } from "@/src/components/ui/button"
import { toast } from "@/src/hooks/use-toast"
import { Switch } from "@/src/components/ui/switch"

export default function SpaceSettings() {
  const [settings, setSettings] = useState({
    chat: true,
    posts: true,
    projectManagement: false,
  })

  // Handle toggle change
  const handleToggle = (setting: keyof typeof settings) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting],
    })
  }

  // Handle save settings
  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your space settings have been updated successfully.",
      action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
    })
  }

  return (
    <main className="flex-1 p-4 sm:p-6">
      <div className="mx-auto max-w-2xl">
        <Card className="overflow-hidden">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle>Space Settings</CardTitle>
            <CardDescription>
              Configure which features are available in this space and manage its status.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 px-4 sm:px-6">
            {/* Features Section */}
            <div className="space-y-4">
              <h3 className="text-base font-medium">Features</h3>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="chat" className="text-base">
                      Chat
                    </Label>
                    <p className="text-sm text-muted-foreground">Enable real-time chat functionality in this space</p>
                  </div>
                  <Switch id="chat" checked={settings.chat} onCheckedChange={() => handleToggle("chat")} />
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="posts" className="text-base">
                      Posts
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Allow users to create and share posts in this space
                    </p>
                  </div>
                  <Switch id="posts" checked={settings.posts} onCheckedChange={() => handleToggle("posts")} />
                </div>
                <Separator />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label htmlFor="projectManagement" className="text-base">
                      Project Management
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Enable project tracking and management tools in this space
                    </p>
                  </div>
                  <Switch
                    id="projectManagement"
                    checked={settings.projectManagement}
                    onCheckedChange={() => handleToggle("projectManagement")}
                  />
                </div>
              </div>
            </div>
            <div className="pt-4">
              <Button onClick={handleSaveSettings} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}