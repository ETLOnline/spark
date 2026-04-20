"use client"

import { useState, useRef } from "react"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/src/components/ui/table"
import {
  SubmitFeedbackAction,
  GetAllFeedbackAction
} from "@/src/server-actions/Feedback/Feedback"
import { useToast } from "@/src/hooks/use-toast"
import { Upload } from "lucide-react"

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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [feedbackList, setFeedbackList] = useState<FeedbackData[]>([])
  const [isLoadingList, setIsLoadingList] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    description: ""
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // In a real implementation, you would upload the file first and get a URL
      // For now, we'll just pass the file name or a placeholder URL
      const fileUrl = selectedFile ? `uploads/${selectedFile.name}` : undefined

      const result = await SubmitFeedbackAction({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        description: formData.description,
        file_url: fileUrl
      })

      if (result.success) {
        toast({
          title: "Feedback Submitted",
          description:
            "Your feedback has been submitted successfully. You will receive a confirmation email shortly.",
          variant: "default"
        })
        setFormData({ name: "", email: "", subject: "", description: "" })
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
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
              <Label htmlFor="file">Attachment (Optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="file"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="flex-1"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                {selectedFile && (
                  <span className="text-sm text-gray-500">
                    {selectedFile.name}
                  </span>
                )}
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Submitting..." : "Submit Feedback"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Feedback List Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Feedback History</CardTitle>
          <Button
            variant="outline"
            onClick={loadFeedbackList}
            disabled={isLoadingList}
          >
            {isLoadingList ? "Loading..." : "Refresh"}
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingList ? (
            <div className="text-center py-4">Loading feedback...</div>
          ) : feedbackList.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No feedback submitted yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>File</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedbackList.map((feedback) => (
                  <TableRow key={feedback.id}>
                    <TableCell className="font-medium">
                      #{feedback.id}
                    </TableCell>
                    <TableCell>{feedback.name}</TableCell>
                    <TableCell>{feedback.email}</TableCell>
                    <TableCell>{feedback.subject}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {feedback.description}
                    </TableCell>
                    <TableCell>
                      {feedback.file_url ? (
                        <a
                          href={feedback.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          View File
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>{formatDate(feedback.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
