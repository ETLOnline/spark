"use client"

import { useState } from "react"
import {
  CardTitle,
  CardHeader,
  CardContent,
  Card
} from "@/src/components/ui/card"
import { SubmitFeedbackAction } from "@/src/server-actions/Feedback/Feedback"
import { useToast } from "@/src/hooks/use-toast"
import { FeedbackForm, FeedbackFormData } from "./FeedbackForm"

export function FeedbackScreen() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: FeedbackFormData) => {
    setIsLoading(true)

    try {
      let fileBase64: string | undefined
      let fileName: string | undefined
      let fileType: string | undefined

      if (data.file) {
        fileName = data.file.name
        fileType = data.file.type
        fileBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(data.file as File)
        })
      }

      const result = await SubmitFeedbackAction({
        name: data.name,
        email: data.email,
        subject: data.subject,
        description: data.description,
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
            <FeedbackForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              enableFileUpload
              pageType="feedback"
            />
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
