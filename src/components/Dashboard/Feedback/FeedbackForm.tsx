"use client"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Label } from "@/src/components/ui/label"
import { FileUpload } from "@/src/components/ui/file-upload"
import { Loader2, Send } from "lucide-react"
import page from "@/src/app/(dashboard)/dashboard/page"

export type FeedbackFormPageType = "feedback" | "contact" | "report" | "support"

export interface FeedbackFormData {
  name: string
  email: string
  subject: string
  description: string
  file?: File | null
}

export interface FeedbackFormProps {
  onSubmit: (data: FeedbackFormData) => void | Promise<void>
  enableFileUpload?: boolean
  isLoading?: boolean
  pageType?: FeedbackFormPageType
}

const INITIAL_VALUES: Omit<FeedbackFormData, "file"> = {
  name: "",
  email: "",
  subject: "",
  description: ""
}

export function FeedbackForm({
  onSubmit,
  enableFileUpload = false,
  isLoading = false,
  pageType = "feedback"
}: FeedbackFormProps) {
  const [formData, setFormData] =
    useState<Omit<FeedbackFormData, "file">>(INITIAL_VALUES)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileUploadResetKey, setFileUploadResetKey] = useState(0)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (files: File[]) => {
    setSelectedFile(files[0] || null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    await onSubmit({
      ...formData,
      ...(enableFileUpload ? { file: selectedFile } : {})
    })

    setFormData(INITIAL_VALUES)
    setSelectedFile(null)
    setFileUploadResetKey((prev) => prev + 1)
  }

  return (
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
          placeholder={"Your subject"}
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
          placeholder={
            pageType === "contact"
              ? "How can we help you?"
              : "Describe your feeedback, bug, or suggestion in detail"
          }
          rows={5}
          value={formData.description}
          onChange={handleChange}
          disabled={isLoading}
          className="resize-none"
          required
        />
      </div>

      {enableFileUpload && (
        <div className="space-y-1.5">
          <Label>Screenshot or Image (optional)</Label>
          <FileUpload
            key={fileUploadResetKey}
            fileType="image"
            accept="image/*"
            multiple={false}
            onChange={handleFileChange}
          />
        </div>
      )}

      <Button type="submit" className="w-full gap-2" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {pageType === "contact" ? "Sending..." : "Submitting..."}
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            {pageType === "contact" ? "Send Message" : "Submit Feedback"}
          </>
        )}
      </Button>
    </form>
  )
}
