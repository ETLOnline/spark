import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Switch } from "@/src/components/ui/switch"
import React from 'react'

function ProjectNotifications() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Configure how you receive notifications for this project</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Email Notifications</h4>
              <p className="text-sm text-muted-foreground">Receive email notifications for important updates</p>
            </div>
            <Switch id="email-notifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Task Assignments</h4>
              <p className="text-sm text-muted-foreground">Get notified when you're assigned to a task</p>
            </div>
            <Switch id="task-assignments" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Task Comments</h4>
              <p className="text-sm text-muted-foreground">Get notified when someone comments on your tasks</p>
            </div>
            <Switch id="task-comments" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Sprint Updates</h4>
              <p className="text-sm text-muted-foreground">Get notified about sprint starts and completions</p>
            </div>
            <Switch id="sprint-updates" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">File Uploads</h4>
              <p className="text-sm text-muted-foreground">Get notified when new files are uploaded</p>
            </div>
            <Switch id="file-uploads" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Daily Digest</h4>
              <p className="text-sm text-muted-foreground">Receive a daily summary of all project activities</p>
            </div>
            <Switch id="daily-digest" />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button>Save Preferences</Button>
      </CardFooter>
    </Card>
  )
}

export default ProjectNotifications