"use client"

import React, { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"
import { cn } from "@/src/lib/utils"
import { RefreshCw, Search } from "lucide-react"
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
    value: "session_slot_time_changed",
    label: "Session Slot Time Changed (Mentee)",
    file: "session_slot_time_changed.html"
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
  },
  {
    value: "advisor_request_accepted",
    label: "Advisor Request Accepted Email",
    file: "advisor_request_accepted.html"
  },
  {
    value: "advisor_request_rejected",
    label: "Advisor Request Rejected Email",
    file: "advisor_request_rejected.html"
  },
  {
    value: "advisor_request_expired",
    label: "Advisor Request Expired Email",
    file: "advisor_request_expired.html"
  },
  {
    value: "advisor_request_advisor_declined",
    label: "Advisor Request Single Advisor Declined Email",
    file: "advisor_request_advisor_declined.html"
  },
  {
    value: "identity_verification_otp",
    label: "Identity Verification OTP",
    file: "identity_verification_otp.html"
  },
  {
    value: "identity_verified",
    label: "Identity Verified Success",
    file: "identity_verified_success.html"
  },
  {
    value: "new_advisor_request",
    label: "New Advisor Request Email",
    file: "new_advisor_request.html"
  },
  {
    value: "milestone_completed_pending_verification",
    label: "Milestone Complete (Pending Verification)",
    file: "milestone_completed_pending_verification.html"
  }
]

export default function EmailPreviewPage() {
  const [selectedTemplate, setSelectedTemplate] =
    useState<string>("update_task")
  const [templateHTML, setTemplateHTML] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [search, setSearch] = useState("")

  const filteredTemplates = emailTemplates.filter((template) => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      template.label.toLowerCase().includes(q) ||
      template.value.toLowerCase().includes(q) ||
      template.file.toLowerCase().includes(q)
    )
  })

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
                <div className="relative mb-2">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search templates..."
                    className="pl-8"
                  />
                </div>
                <div className="max-h-80 overflow-y-auto rounded-md border divide-y">
                  {filteredTemplates.length === 0 && (
                    <p className="p-3 text-sm text-muted-foreground">
                      No templates match "{search}".
                    </p>
                  )}
                  {filteredTemplates.map((template) => (
                    <button
                      key={template.value}
                      type="button"
                      onClick={() => setSelectedTemplate(template.value)}
                      className={cn(
                        "w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors",
                        selectedTemplate === template.value &&
                          "bg-muted font-medium"
                      )}
                    >
                      {template.label}
                    </button>
                  ))}
                </div>
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
