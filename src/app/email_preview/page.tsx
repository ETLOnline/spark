"use client"

import React, { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/src/components/ui/select"
import { Badge } from "@/src/components/ui/badge"
import { RefreshCw } from "lucide-react"
import NotFound from "@/src/components/Dashboard/NotFound/NotFound"

const emailTemplates = [
  {
    value: "update_task",
    label: "Task Update Email",
    file: "update_task.html"
  },
  {
    value: "new_connection",
    label: "New Connection Email",
    file: "new_connection.html"
  },
  {
    value: "accept_connection",
    label: "Accept Connection Email",
    file: "accept_connection.html"
  },
  {
    value: "project_invite",
    label: "Project Invite Email",
    file: "project_invite.html"
  },
  {
    value: "chat_invite",
    label: "Chat Invite Email",
    file: "chat_invite.html"
  },
  {
    value: "community_request",
    label: "Community Request Submitted (User)",
    file: "submit_community_request.html"
  },
  {
    value: "admin_new_community_request",
    label: "New Community Request (Admin)",
    file: "admin-community-request-notification.html"
  },
  {
    value: "community_request_accepted",
    label: "Community Request Approved",
    file: "community_creation_request_approved.html"
  },
  {
    value: "community_request_rejected",
    label: "Community Request Declined",
    file: "community_creation_request_decline.html"
  },
  {
    value: "join_invite_email",
    label: "Join Invite Email",
    file: "join_invite_email.html"
  },
  {
    value: "feedback_submitted",
    label: "Feedback Submitted (User)",
    file: "user_message_received.html"
  },
  {
    value: "new_feedback_admin",
    label: "New Feedback (Admin)",
    file: "admin_message_received.html"
  },
  {
    value: "contact_us_submitted",
    label: "Contact Us Submitted (User)",
    file: "user_message_received.html"
  },
  {
    value: "new_contact_us_admin",
    label: "New Contact Us (Admin)",
    file: "admin_message_received.html"
  },
  {
    value: "new_session_request",
    label: "New Session Request Email",
    file: "new_session_request.html"
  },
  {
    value: "session_slot_suggested",
    label: "Session Slot Suggested (Mentee)",
    file: "session_slot_suggested.html"
  },
  {
    value: "session_request_accepted",
    label: "Session Request Accepted Email",
    file: "session_request_response.html"
  },
  {
    value: "session_request_rejected",
    label: "Session Request Rejected Email",
    file: "session_request_response.html"
  }
]

export default function EmailPreviewPage() {
  const [selectedTemplate, setSelectedTemplate] =
    useState<string>("update_task")
  const [templateHTML, setTemplateHTML] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  const loadTemplate = async (templateName: string) => {
    setLoading(true)
    setError("")
    try {
      const fileName = emailTemplates.find(
        (t) => t.value === templateName
      )?.file
      if (!fileName) {
        throw new Error(`No file mapped for template ${templateName}`)
      }
      const response = await fetch(`/email-templates/${fileName}`)
      if (!response.ok) {
        throw new Error(`Template ${fileName} not found`)
      }
      const html = await response.text()
      setTemplateHTML(html)
    } catch (err) {
      console.error("Error loading template:", err)
      setError(`Failed to load template: ${templateName}`)
      setTemplateHTML(`
        <div style="padding: 20px; background: #f8fafc; font-family: Arial;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px;">
            <h2>Email Template: ${templateName}</h2>
            <p>Template would be loaded from: /public/email-templates/${templateName}.html</p>
          </div>
        </div>
      `)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTemplate(selectedTemplate)
  }, [selectedTemplate])

  const isDev = process.env.NEXT_PUBLIC_ENABLE_EMAIL_PREVIEW === "true"
  if (!isDev) {
    return <NotFound />
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Email Template Preview</h1>
        <p className="text-muted-foreground">
          Preview and test your email templates with placeholders
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Controls */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Template Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Select Template
                </label>
                <Select
                  value={selectedTemplate}
                  onValueChange={setSelectedTemplate}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {emailTemplates.map((template) => (
                      <SelectItem key={template.value} value={template.value}>
                        {template.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => loadTemplate(selectedTemplate)}
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Reload Template
              </Button>

              <div className="space-y-2">
                <h4 className="font-medium">Template Info:</h4>
                <Badge variant="secondary">
                  {
                    emailTemplates.find((t) => t.value === selectedTemplate)
                      ?.file
                  }
                </Badge>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:col-span-3">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="border rounded-md overflow-auto p-4 bg-white"
                style={{ minHeight: "400px" }}
                dangerouslySetInnerHTML={{ __html: templateHTML }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
