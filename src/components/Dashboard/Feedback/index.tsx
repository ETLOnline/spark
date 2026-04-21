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
import { Loader2, Send } from "lucide-react"

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleScreenshotChange = (files: File[]) => {
    setSelectedFile(files[0] || null)
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
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-1">Feedback</h1>
          <p className="text-muted-foreground text-sm">
            Found a bug or have a suggestion? We'd love to hear from you.
          </p>
        </div>

        <Card className="spark-gradient-panel-bg">
          <CardHeader>
            <CardTitle className="text-lg">Submit Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="subject">
                  Subject <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="Short summary of your feedback"
                  value={formData.subject}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe your feedback, bug, or suggestion in detail..."
                  rows={5}
                  value={formData.description}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="resize-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Screenshot or Image (optional)</Label>
                <FileUpload
                  key={fileUploadResetKey}
                  fileType="image"
                  accept="image/*"
                  multiple={false}
                  onChange={handleScreenshotChange}
                />
              </div>

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {isLoading ? "Submitting..." : "Submit Feedback"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
