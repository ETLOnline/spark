"use client"

import React, { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { SelectProfile, SelectUser } from "@/src/db/schema"
import { useServerAction } from "@/src/hooks/useServerAction"
import { updateUserProfileAction } from "@/src/server-actions/profile/profile"
import { toast } from "@/src/hooks/use-toast"
import { z } from "zod"

import { zodResolver } from "@hookform/resolvers/zod"
import { useConfirmClose } from "@/src/hooks/useConfirmClose"
import { UnsavedChangesDialog } from "@/src/components/common/unsavedChangesDialog"
import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter
} from "@/src/components/ui/dialog"
import { AlertDialogHeader } from "@/src/components/ui/alert-dialog"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { socialPlatforms } from "@/src/components/ProfileCompletion/constants"
import { ScrollArea } from "@/src/components/ui/scroll-area"

const socialLinksSchema = z.object({
  personal_website_url: z.string().url().optional().or(z.literal("")),
  github_url: z.string().url().optional().or(z.literal("")),
  linkedin_url: z.string().url().optional().or(z.literal("")),
  twitter_url: z.string().url().optional().or(z.literal("")),
  instagram_url: z.string().url().optional().or(z.literal(""))
})

const platformToFieldMap: Record<
  string,
  keyof z.infer<typeof socialLinksSchema>
> = {
  website: "personal_website_url",
  github: "github_url",
  linkedin: "linkedin_url",
  twitter: "twitter_url",
  instagram: "instagram_url"
}

interface Props {
  user: SelectUser
  profile: SelectProfile
  setprofile: Dispatch<SetStateAction<SelectProfile | null | undefined>>
}

export default function EditSocialLinksModal({
  user,
  profile,
  setprofile
}: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [submitLoading, , , submitUserProfile] = useServerAction(
    updateUserProfileAction
  )

  const form = useForm({
    resolver: zodResolver(socialLinksSchema)
  })

  const errors = form.formState.errors
  const isDirty = form.formState.isDirty

  useEffect(() => {
    if (profile) {
      form.reset({
        personal_website_url: profile.personal_website_url || "",
        github_url: profile.github_url || "",
        linkedin_url: profile.linkedin_url || "",
        twitter_url: profile.twitter_url || "",
        instagram_url: profile.instagram_url || ""
      })
    }
  }, [profile, isDialogOpen])

  async function handleSubmit(data: any) {
    try {
      const res = await submitUserProfile(user.unique_id, data)

      if (res?.success) {
        setprofile((prev) => ({ ...prev!, ...data }))

        toast({ title: "Social links updated", duration: 2000 })
        setIsDialogOpen(false)
      }
    } catch {
      toast({
        title: "Unable to update social links",
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

  return (
    <>
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) =>
          open ? setIsDialogOpen(true) : handleClose(false)
        }
      >
        <DialogTrigger asChild>
          <Button variant="edit" size="sm">
            Edit
          </Button>
        </DialogTrigger>

        <DialogContent
          className="sm:max-w-[450px] px-6 py-6"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <AlertDialogHeader>
            <DialogTitle>Edit Social Links</DialogTitle>
            <DialogDescription>
              Update your website and social media URLs.
            </DialogDescription>
          </AlertDialogHeader>
          <ScrollArea className="h-96 overflow-auto pr-3">
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4 mt-4"
            >
              {socialPlatforms.map((platform) => {
                const fieldName = platformToFieldMap[platform.key]

                return (
                  <div key={platform.key} className="flex flex-col gap-2 ">
                    <Label className="font-semibold flex items-center gap-2">
                      {platform.label}
                    </Label>

                    <Controller
                      name={fieldName}
                      control={form.control}
                      defaultValue=""
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder={platform.placeholder}
                          className="border-gray-600 text-white placeholder-gray-400"
                        />
                      )}
                    />

                    {errors[fieldName] && (
                      <p className="text-red-500 text-sm">
                        {String(errors[fieldName]?.message)}
                      </p>
                    )}
                  </div>
                )
              })}

              <DialogFooter>
                <Button
                  loading={submitLoading}
                  disabled={
                    submitLoading ||
                    Object.values(form.watch()).every((value) => !value)
                  }
                  className="w-full"
                >
                  Save changes
                </Button>
              </DialogFooter>
            </form>
          </ScrollArea>
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
