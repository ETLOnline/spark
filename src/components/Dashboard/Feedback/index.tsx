"use client"

import { useState } from "react"
import {
  CardTitle,
  CardHeader,
  CardContent,
  Card
} from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Label } from "@/src/components/ui/label"

import {
  SubmitFeedbackAction,
  GetAllFeedbackAction
} from "@/src/server-actions/Feedback/Feedback"
import { useToast } from "@/src/hooks/use-toast"
import { FileUpload } from "../../ui/file-upload"

interface FeedbackData {
  id: number
  name: string
  email: string
  subject: string
  description: string
  file_url: string | null
  created_at: string
}

export function FeedbackScreen() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [feedbackList, setFeedbackList] = useState<FeedbackData[]>([])
  const [isLoadingList, setIsLoadingList] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileUploadResetKey, setFileUploadResetKey] = useState(0)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    description: "",
    fileUrl: null
  })

  const loadFeedbackList = async () => {
    setIsLoadingList(true)
    try {
      const result = await GetAllFeedbackAction()
      if (result.success) {
        setFeedbackList(result.feedback as FeedbackData[])
      }
    } catch (error) {
      console.error("Error loading feedback:", error)
    } finally {
      setIsLoadingList(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let fileBase64: string | undefined
      let fileName: string | undefined
      let fileType: string | undefined

      if (selectedFile) {
        fileName = selectedFile.name
        fileType = selectedFile.type
        fileBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(selectedFile)
        })
      }

      const result = await SubmitFeedbackAction({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        description: formData.description,
        fileBase64,
        fileName,
        fileType
      })

      if (result.success) {
        toast({
          title: "Feedback Submitted",
          description:
            "Your feedback has been submitted successfully. You will receive a confirmation email shortly.",
          variant: "default"
        })
        setFormData({
          name: "",
          email: "",
          subject: "",
          description: "",
          fileUrl: null
        })
        setSelectedFile(null)
        setFileUploadResetKey((prev) => prev + 1)
        loadFeedbackList()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Feedback Form */}
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Submit Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="Enter feedback subject"
                value={formData.subject}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, subject: e.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your feedback in detail"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value
                  }))
                }
                rows={5}
                required
              />
            </div>

            <div className="space-y-2">
              <p>Screenshot or Image (optional)</p>
              <FileUpload
                key={fileUploadResetKey}
                onChange={(files) => setSelectedFile(files[0] || null)}
                accept="image/*"
                fileType="image"
                multiple={false}
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Submitting..." : "Submit Feedback"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
