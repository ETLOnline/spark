import React, { Dispatch, SetStateAction, useState } from "react"
import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { FileUpload } from "../../ui/file-upload"
import { toast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  RemoveCoverImageAction,
  UpdateCoverImageAction
} from "@/src/server-actions/User/User"
import { SelectUser } from "@/src/db/schema"

interface changeCoverImageDialogProps {
  isChangeCoverImageOpen: boolean
  setIsChangeCoverImageOpen: Dispatch<SetStateAction<boolean>>
  user: SelectUser
  setUserCoverImage: Dispatch<SetStateAction<string | null>>
}

function ChangeCoverImageDialog({
  isChangeCoverImageOpen,
  setIsChangeCoverImageOpen,
  user,
  setUserCoverImage
}: changeCoverImageDialogProps) {
  const [coverImage, setCoverImage] = useState<File | null>(null)

  const [uploadCoverLoading, , , UploadCover] = useServerAction(
    UpdateCoverImageAction
  )
  const [removeCoverLoading, , , RemoveCover] = useServerAction(
    RemoveCoverImageAction
  )

  const handleUploadCover = async () => {
    if (!user) return

    if (!coverImage) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please choose an image first."
      })
      return
    }

    const reader = new FileReader()

    reader.onloadend = async () => {
      const base64 = reader.result as string

      try {
        const res = await UploadCover(
          user.unique_id,
          coverImage.name,
          base64,
          coverImage.type
        )

        if (res?.success && res?.data) {
          setUserCoverImage(res.data.cover_image)
          toast({
            title: "Cover image updated!",
            description: "Your cover image has been successfully updated.",
            duration: 3000
          })
          setIsChangeCoverImageOpen(false)
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Something went wrong while uploading.",
          duration: 3000
        })
      }
    }
    reader.readAsDataURL(coverImage)
  }

  const handleRemoveCover = async () => {
    if (!user) return

    try {
      const res = await RemoveCover(user.unique_id)

      if (res?.success && res?.data) {
        setUserCoverImage(null)
        toast({
          title: "Cover image removed!",
          description: "Your cover image has been successfully removed.",
          duration: 3000
        })
        setIsChangeCoverImageOpen(false)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong while removing.",
        duration: 3000
      })
    }
  }

  return (
    <Dialog
      open={isChangeCoverImageOpen}
      onOpenChange={setIsChangeCoverImageOpen}
    >
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Cover Photo</DialogTitle>
          <DialogDescription>
            Pick an image to set as your cover photo.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="cover_image">Select a file</Label>
            <FileUpload
              accept="image/*"
              onChange={(files) => {
                setCoverImage(files[0])
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>

          <Button
            type="button"
            variant="destructive"
            loading={removeCoverLoading}
            onClick={handleRemoveCover}
          >
            Remove
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleUploadCover}
            loading={uploadCoverLoading}
          >
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ChangeCoverImageDialog
