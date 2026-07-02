"use client"

import React, { Dispatch, SetStateAction, useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "../../ui/dialog"
import { Button } from "../../ui/button"
import { Label } from "../../ui/label"
import { Input } from "../../ui/input"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { SelectProfile, SelectUser } from "@/src/db/schema"
import { useServerAction } from "@/src/hooks/useServerAction"
import { toast } from "@/src/hooks/use-toast"
import { UnsavedChangesDialog } from "../../common/unsavedChangesDialog"
import { useConfirmClose } from "@/src/hooks/useConfirmClose"
import { SaveMentorSetupAction } from "@/src/server-actions/Mentor/MentorActions"

interface Props {
  user: SelectUser
  profile: SelectProfile
  setProfile: Dispatch<SetStateAction<SelectProfile | null | undefined>>
}

const mentorSchema = z.object({
  professional_title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Maximum 100 characters"),
  company: z
    .string()
    .min(1, "Company is required")
    .max(100, "Maximum 100 characters")
})

type MentorFormValues = z.infer<typeof mentorSchema>

function EditMentorModal({ user, profile, setProfile }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, , , saveMentorSetup] = useServerAction(SaveMentorSetupAction)

  const form = useForm<MentorFormValues>({
    resolver: zodResolver(mentorSchema)
  })

  const {
    formState: { errors, isDirty }
  } = form

  useEffect(() => {
    if (!isDialogOpen) return
    form.reset({
      professional_title: profile?.professional_title || "",
      company: profile?.company || ""
    })
  }, [isDialogOpen])

  async function handleSubmit(data: MentorFormValues) {
    const res = await saveMentorSetup({
      userId: user.unique_id,
      ...data
    })

    if (res?.success) {
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              professional_title: data.professional_title,
              company: data.company
            }
          : prev
      )
      toast({ title: "Mentor profile updated", duration: 2000 })
      setIsDialogOpen(false)
    } else {
      toast({
        title: "Failed to update",
        variant: "destructive",
        duration: 2000
      })
    }
  }

  const { showConfirmation, setShowConfirmation, handleClose } =
    useConfirmClose({
      isDirty,
      onClose: () => setIsDialogOpen(false)
    })

  const handleDialogChange = (open: boolean) => {
    if (open) setIsDialogOpen(true)
    else handleClose(false)
  }

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <DialogTrigger asChild>
          <Button variant="edit" size="sm">
            Edit
          </Button>
        </DialogTrigger>

        <DialogContent
          className="sm:max-w-[460px]"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Edit Mentor Profile</DialogTitle>
            <DialogDescription>
              Update your professional details. Manage availability from your
              profile calendar.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid gap-4 py-4">
              {/* Professional Title */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="professional_title" className="font-semibold">
                  Professional Title
                </Label>
                <Controller
                  name="professional_title"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      id="professional_title"
                      placeholder="e.g. Senior Software Engineer"
                      {...field}
                    />
                  )}
                />
                {errors.professional_title && (
                  <span className="text-red-500 text-sm">
                    {errors.professional_title.message}
                  </span>
                )}
              </div>

              {/* Company */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="company" className="font-semibold">
                  Company / Organisation
                </Label>
                <Controller
                  name="company"
                  control={form.control}
                  render={({ field }) => (
                    <Input id="company" placeholder="e.g. Google" {...field} />
                  )}
                />
                {errors.company && (
                  <span className="text-red-500 text-sm">
                    {errors.company.message}
                  </span>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button loading={loading}>Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <UnsavedChangesDialog
        showConfirmation={showConfirmation}
        setShowConfirmation={setShowConfirmation}
        setIsActualDialogOpen={setIsDialogOpen}
      />
    </>
  )
}

export default EditMentorModal
