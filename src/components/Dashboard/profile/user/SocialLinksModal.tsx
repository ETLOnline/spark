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

const socialLinksSchema = z.object({
  personal_website_url: z
    .string()
    .url("Invalid URL")
    .optional()
    .or(z.literal("")),
  github_url: z.string().url("Invalid GitHub URL").optional().or(z.literal("")),
  linkedin_url: z
    .string()
    .url("Invalid LinkedIn URL")
    .optional()
    .or(z.literal("")),
  twitter_url: z
    .string()
    .url("Invalid Twitter URL")
    .optional()
    .or(z.literal("")),
  instagram_url: z
    .string()
    .url("Invalid Instagram URL")
    .optional()
    .or(z.literal(""))
})

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

  const error = form.formState.errors
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
      const payload = {
        ...data
      }

      const res = await submitUserProfile(user.unique_id, payload)

      if (res?.success) {
        setprofile((prev) => ({
          ...prev!,
          ...payload
        }))

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

  const handleDialogChange = (open: boolean) => {
    if (open) setIsDialogOpen(true)
    else handleClose(false)
  }

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
        <DialogTrigger asChild>
          <Button variant="edit" size={"sm"}>
            Edit
          </Button>
        </DialogTrigger>

        <DialogContent
          className="sm:max-w-[450px]"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <AlertDialogHeader>
            <DialogTitle>Edit Social Links</DialogTitle>
            <DialogDescription>
              Update your website and social media URLs.
            </DialogDescription>
          </AlertDialogHeader>

          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="grid gap-4 py-4">
              {/* Website */}
              <div className="flex flex-col gap-2">
                <Label className="font-semibold">Website</Label>
                <Controller
                  name="personal_website_url"
                  control={form.control}
                  defaultValue=""
                  render={({ field }) => (
                    <Input placeholder="https://yourwebsite.com" {...field} />
                  )}
                />
                {error.personal_website_url && (
                  <p className="text-red-500 text-sm">
                    {String(error.personal_website_url.message)}
                  </p>
                )}
              </div>

              {/* GitHub */}
              <div className="flex flex-col gap-2">
                <Label className="font-semibold">GitHub</Label>
                <Controller
                  name="github_url"
                  control={form.control}
                  defaultValue=""
                  render={({ field }) => (
                    <Input
                      placeholder="https://github.com/username"
                      {...field}
                    />
                  )}
                />
                {error.github_url && (
                  <p className="text-red-500 text-sm">
                    {String(error.github_url.message)}
                  </p>
                )}
              </div>

              {/* LinkedIn */}
              <div className="flex flex-col gap-2">
                <Label className="font-semibold">LinkedIn</Label>
                <Controller
                  name="linkedin_url"
                  control={form.control}
                  defaultValue=""
                  render={({ field }) => (
                    <Input
                      placeholder="https://linkedin.com/in/username"
                      {...field}
                    />
                  )}
                />
                {error.linkedin_url && (
                  <p className="text-red-500 text-sm">
                    {String(error.linkedin_url.message)}
                  </p>
                )}
              </div>

              {/* Twitter */}
              <div className="flex flex-col gap-2">
                <Label className="font-semibold">Twitter</Label>
                <Controller
                  name="twitter_url"
                  control={form.control}
                  defaultValue=""
                  render={({ field }) => (
                    <Input
                      placeholder="https://twitter.com/username"
                      {...field}
                    />
                  )}
                />
                {error.twitter_url && (
                  <p className="text-red-500 text-sm">
                    {String(error.twitter_url.message)}
                  </p>
                )}
              </div>

              {/* Instagram */}
              <div className="flex flex-col gap-2">
                <Label className="font-semibold">Instagram</Label>
                <Controller
                  name="instagram_url"
                  control={form.control}
                  defaultValue=""
                  render={({ field }) => (
                    <Input
                      placeholder="https://instagram.com/username"
                      {...field}
                    />
                  )}
                />
                {error.instagram_url && (
                  <p className="text-red-500 text-sm">
                    {String(error.instagram_url.message)}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button loading={submitLoading}>Save changes</Button>
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
