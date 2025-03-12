"use client"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/Loader/types/loader-types"
import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { InsertSpace } from "@/src/db/schema"
import { toast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  CreateSpaceAction,
  IsSlugAvailableAction
} from "@/src/server-actions/Space/Space"
import { channelStore } from "@/src/store/channel/channelStore"
import { spaceStore } from "@/src/store/space/spaceStore"
import { userStore } from "@/src/store/user/userStore"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAtom, useAtomValue } from "jotai"
import { CircleCheck, CircleXIcon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

const spaceSchema = z.object({
  space_name: z.string().min(1, "Space name required").max(30, "Too long"),
  space_slug: z.string().max(15, "Slug is too long"),
  description: z
    .string()
    .min(1, "Description required")
    .max(50, "Description is too long")
})

function CreateSpaceModal() {
  const [space, setSpace] = useAtom(spaceStore.spaces)
  const authUser = useAtomValue(userStore.AuthUser)
  const channelId = useAtomValue(channelStore.selectedChannel)?.id

  const [slugAvailableMessage, setslugAvailableMessage] = useState<string>("")
  const [spaceFormModelVisibility, setSpaceFormModelVisibility] =
    useState(false)

  const timeoutId = useRef<NodeJS.Timeout>(null)

  const [addSpaceLoading, addSpaceData, addSpaceError, CreateNewSpace] =
    useServerAction(CreateSpaceAction)
  const [
    isSlugAvailableLoading,
    isSlugAvailableData,
    isSlugAvailableError,
    isSlugAvailable
  ] = useServerAction(IsSlugAvailableAction)

  const form = useForm({
    resolver: zodResolver(spaceSchema)
  })
  const error = form.formState.errors

  useEffect(() => {
    const value = form.getValues("space_name")

    if (value) {
      checkSlugAvailability(value + form.getValues("space_slug"))
    }
  }, [form.watch("space_name")])

  useEffect(() => {
    const value = form.getValues("space_slug")

    if (value) {
      checkSlugAvailability(form.getValues("space_name") + value)
    }
  }, [form.watch("space_slug")])

  async function handleCreateSpace(data: Partial<InsertSpace>) {
    try {
      data.created_by = authUser?.unique_id as string
      data.channel_id = channelId as string
      data.space_name = (data.space_name as string).trim()
      data.space_slug = `${
        data.space_name
      }${data.space_slug?.trim()}`.replaceAll(" ", "-")
      const CreateSpaceModal = await CreateNewSpace(data as InsertSpace)
      if (CreateSpaceModal?.success && CreateSpaceModal.data) {
        setSpace([...space, ...CreateSpaceModal.data])
        setSpaceFormModelVisibility(false)
        toast({
          title: "Space created",
          duration: 3000
        })
      }
    } catch {
      toast({
        title: "unable to create space",
        variant: "destructive",
        duration: 3000
      })
    }
  }

  const checkSlugAvailability = async (slug: string) => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current)
    }
    timeoutId.current = setTimeout(async () => {
      const result = await isSlugAvailable(slug, channelId as string)
      if (result?.success) {
        if (!result?.data) {
          form.setError("space_slug", {
            type: "manual",
            message: `the slug, ${slug.replaceAll(" ", "-")} is already taken`
          })
          setslugAvailableMessage("")
        } else {
          form.clearErrors("space_slug")
          setslugAvailableMessage(
            `the slug, ${slug.replaceAll(" ", "-")} is available`
          )
        }
      }
    }, 2500)
  }

  return (
    <div className="flex justify-center">
      <Dialog
        open={spaceFormModelVisibility}
        onOpenChange={(open) => {
          setSpaceFormModelVisibility(open)
        }}
      >
        <DialogTrigger>
          <Button>Create Space</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Space</DialogTitle>
            <DialogDescription>You can create Spaces.</DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(handleCreateSpace)}>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col">
                <div className="flex items-center justify-between">
                  <Label htmlFor="space_name">Title</Label>
                  <div className="w-[70%]">
                    <Controller
                      name="space_name"
                      defaultValue=""
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          id="space_name"
                          placeholder="Enter space title"
                          {...field}
                          className="col-span-3"
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="text-left">
                  {error.space_name && (
                    <span className="text-red-500 text-sm">
                      {error.space_name.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center justify-between">
                  <Label htmlFor="space_name">Space Slug</Label>
                  <div className="w-[70%]">
                    <Controller
                      name="space_slug"
                      defaultValue=""
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          id="space_slug"
                          placeholder="Enter space slug"
                          {...field}
                          className="col-span-3"
                          variant="resistive"
                          prefix={form.getValues("space_name")}
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="text-left flex items-center gap-x-2 pt-1 pl-[30%]">
                  {error.space_slug && !isSlugAvailableLoading && (
                    <div className="flex items-center text-red-500">
                      <CircleXIcon className="mr-2 h-4 w-4" />
                      <span className="text-sm">
                        {error.space_slug.message}
                      </span>
                    </div>
                  )}
                  {isSlugAvailableLoading && (
                    <>
                      <Loader size={LoaderSizes.sm} />
                      <span className="text-gray-500 text-sm">
                        checking slug availibity
                      </span>
                    </>
                  )}
                  {slugAvailableMessage && !isSlugAvailableLoading && (
                    <div className="flex items-center gap-x-1 text-green-500">
                      <CircleCheck className="mr-2 h-4 w-4" />
                      <span className="text-sm">{slugAvailableMessage}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Description</Label>
                  <div className="w-[70%]">
                    <Controller
                      name="description"
                      control={form.control}
                      render={({ field }) => (
                        <Textarea
                          id="description"
                          placeholder="Description"
                          {...field}
                          className="col-span-3"
                        />
                      )}
                    />
                  </div>
                </div>
                <div className="text-left">
                  {error.description && (
                    <span className="text-red-500 text-sm">
                      {error.description.message}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="submit"
                loading={addSpaceLoading}
                disabled={error.space_name?.message ? true : false}
              >
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CreateSpaceModal
