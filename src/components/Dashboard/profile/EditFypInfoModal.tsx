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
import { Textarea } from "../../ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../../ui/select"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { SelectProfile, SelectUser } from "@/src/db/schema"
import { useServerAction } from "@/src/hooks/useServerAction"
import { toast } from "@/src/hooks/use-toast"
import { UnsavedChangesDialog } from "../../common/unsavedChangesDialog"
import { useConfirmClose } from "@/src/hooks/useConfirmClose"
import { updateUserProfileAction } from "@/src/server-actions/profile/profile"

interface Props {
  user: SelectUser
  profile: SelectProfile
  setProfile: Dispatch<SetStateAction<SelectProfile | null | undefined>>
}

export const FYP_STATUS_OPTIONS = [
  "Not Started",
  "In Progress",
  "Completed",
  "On Hold"
] as const

const fypInfoSchema = z.object({
  fyp_status: z.enum(FYP_STATUS_OPTIONS).optional(),
  learning_goals: z.string().max(1000, "Maximum 1000 characters").optional()
})

type FypInfoFormValues = z.infer<typeof fypInfoSchema>

function EditFypInfoModal({ user, profile, setProfile }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loading, , , saveFypInfo] = useServerAction(updateUserProfileAction)

  const form = useForm<FypInfoFormValues>({
    resolver: zodResolver(fypInfoSchema)
  })

  const {
    formState: { errors, isDirty }
  } = form

  useEffect(() => {
    if (!isDialogOpen) return
    form.reset({
      fyp_status:
        (profile?.fyp_status as FypInfoFormValues["fyp_status"]) || undefined,
      learning_goals: profile?.learning_goals || ""
    })
  }, [isDialogOpen])

  async function handleSubmit(data: FypInfoFormValues) {
    const res = await saveFypInfo(user.unique_id, data)

    if (res?.success) {
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              fyp_status: data.fyp_status || null,
              learning_goals: data.learning_goals || null
            }
          : prev
      )
      toast({ title: "Profile updated", duration: 2000 })
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
            {profile?.fyp_status || profile?.learning_goals ? "Edit" : "Add"}
          </Button>
        </DialogTrigger>

        <DialogContent
          className="sm:max-w-[460px]"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>FYP & Learning Goals</DialogTitle>
            <DialogDescription>
              Share your final year project status and what you're currently
              working towards.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid gap-4 py-4">
              {/* FYP Status */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="fyp_status" className="font-semibold">
                  FYP Status
                </Label>
                <Controller
                  name="fyp_status"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="fyp_status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {FYP_STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.fyp_status && (
                  <span className="text-red-500 text-sm">
                    {errors.fyp_status.message}
                  </span>
                )}
              </div>

              {/* Learning Goals */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="learning_goals" className="font-semibold">
                  Learning Goals
                </Label>
                <Controller
                  name="learning_goals"
                  control={form.control}
                  render={({ field }) => (
                    <Textarea
                      id="learning_goals"
                      placeholder="e.g. Learning system design and cloud infrastructure"
                      rows={4}
                      {...field}
                    />
                  )}
                />
                {errors.learning_goals && (
                  <span className="text-red-500 text-sm">
                    {errors.learning_goals.message}
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

export default EditFypInfoModal
