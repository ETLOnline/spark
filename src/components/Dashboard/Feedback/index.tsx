"use client"

import { useState } from "react"
import { Loader2, Send } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Label } from "@/src/components/ui/label"
import { Button } from "@/src/components/ui/button"
import { FileUpload } from "@/src/components/ui/file-upload"
import { useToast } from "@/src/hooks/use-toast"

interface FeedbackForm {
  name: string
  email: string
  description: string
  screenshot: File | null
}

const INITIAL_FORM: FeedbackForm = {
  name: "",
  email: "",
  description: "",
  screenshot: null
}

export function FeedbackScreen() {
  const { toast } = useToast()
  const [form, setForm] = useState<FeedbackForm>(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleScreenshotChange = (files: File[]) => {
    setForm((prev) => ({ ...prev, screenshot: files[0] ?? null }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.description) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      })
      return
    }

    setSubmitting(true)
    try {
      // TODO: wire up server action
      await new Promise((r) => setTimeout(r, 1000))
      toast({
        title: "Feedback submitted",
        description: "Thank you! We'll review your feedback shortly."
      })
      setForm(INITIAL_FORM)
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
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
                  value={form.name}
                  onChange={handleChange}
                  disabled={submitting}
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
                  value={form.email}
                  onChange={handleChange}
                  disabled={submitting}
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
                  value={form.description}
                  onChange={handleChange}
                  disabled={submitting}
                  className="resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Screenshot or Image (optional)</Label>
                <FileUpload
                  fileType="image"
                  accept="image/*"
                  multiple={false}
                  onChange={handleScreenshotChange}
                />
              </div>

              <Button
                type="submit"
                className="w-full gap-2"
                disabled={submitting}
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {submitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
