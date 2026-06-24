"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from "@/src/components/ui/dialog"
import {
  FeedbackForm,
  FeedbackFormData
} from "@/src/components/Dashboard/Feedback/FeedbackForm"
import { SubmitContactUsAction } from "@/src/server-actions/ContactUs/ContactUs"
import { useToast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"

export function ContactUsDialog() {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const [isSubmitContactUsLoading, , , SubmitContactUs] = useServerAction(
    SubmitContactUsAction
  )

  const handleSubmit = async (data: FeedbackFormData) => {
    try {
      const result = await SubmitContactUs({
        name: data.name,
        email: data.email,
        subject: data.subject,
        description: data.description
      })

      if (result?.success) {
        toast({
          title: "Message Sent",
          description: "Thanks for reaching out. We'll get back to you shortly."
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button type="button" className="hover:text-white transition-colors">
          Contact Us
        </button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => {
          if (isDirty) e.preventDefault()
        }}
      >
        <DialogHeader>
          <DialogTitle>Contact Us</DialogTitle>
          <DialogDescription>
            Have a question? Fill out the form and we'll get back to you.
          </DialogDescription>
        </DialogHeader>
        <FeedbackForm
          onSubmit={handleSubmit}
          isLoading={isSubmitContactUsLoading}
          pageType="contact"
          onDirtyChange={setIsDirty}
        />
      </DialogContent>
    </Dialog>
  )
}
