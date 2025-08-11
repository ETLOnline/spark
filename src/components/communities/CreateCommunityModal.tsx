"use client"

import { useEffect, useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"
import { Button } from "@/src/components/ui/button"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { useAtom, useAtomValue } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { InsertCommunity, SelectCommunity } from "@/src/db/schema"
import { useServerAction } from "@/src/hooks/useServerAction"
import { useToast } from "@/src/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/src/components/ui/select"
import { z } from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CircleCheck, CircleXIcon } from "lucide-react"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import { useDebouncedCallback } from "use-debounce"

import {
  CreateCommunityAction,
  IsCommunitySlugAvailableAction,
  UpdateCommunityAction
} from "@/src/server-actions/Community/Community"
import { communityStore } from "@/src/store/community/communityStore"
import { CommunityCategory } from "@/src/db/data-access/communities/query"
import { slugify } from "@/src/utils/helpers"

const communitySchema = z.object({
  title: z.string().min(1, "Title required").max(50, "Title is too long"),
  description: z
    .string()
    .min(1, "Description required")
    .max(150, "Description is too long"),
  category: z.string().min(1, "Category required"),
  slug: z.string().max(50, "Slug is too long"),
  type: z.enum(["public", "private"], {
    message: "Community type must be 'public' or 'private'"
  })
})

type CommunityFormData = z.infer<typeof communitySchema>

type CreateCommunityModalProps = {
  onCommunityCreated?: (newCommunity: SelectCommunity) => void
  availableCategories: CommunityCategory[]
}

export default function CreateCommunityModal({
  onCommunityCreated,
  availableCategories
}: CreateCommunityModalProps) {
  const [editMode, setEditMode] = useState<boolean>(false)
  const [slugAvailableMessage, setSlugAvailableMessage] = useState<string>("")
  const [currentTitle, setCurrentTitle] = useState<string>("")

  const [communities, setCommunities] = useAtom(communityStore.communities)
  const authUser = useAtomValue(userStore.AuthUser)
  const [communityFormModalVisibility, setCommunityFormModalVisibility] =
    useAtom(communityStore.communityFormModalVisibility)
  const [selectedCommunity, setSelectedCommunity] = useAtom(
    communityStore.selectedCommunity
  )
  const [, setRefreshCommunitiesTrigger] = useAtom(
    communityStore.refreshCommunitiesTriggerAtom
  )

  const [addCommunityLoading, , addCommunityError, CreateCommunity] =
    useServerAction(CreateCommunityAction)
  const [isSlugAvailableLoading, , , isCommunitySlugAvailable] =
    useServerAction(IsCommunitySlugAvailableAction)
  const [
    addUpdateCommunityLoading,
    ,
    addUpdateCommunityError,
    UpdateCommunity
  ] = useServerAction(UpdateCommunityAction)

  const { toast } = useToast()

  const form = useForm<CommunityFormData>({
    resolver: zodResolver(communitySchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      slug: "",
      type: "public"
    }
  })

  const error = form.formState.errors

  const debouncedCheckSlugAvailability = useDebouncedCallback(
    async (
      slug: string,
      communityId: string | undefined,
      onAvailable?: () => void,
      onNotAvailable?: () => void
    ) => {
      if (!slug) {
        setSlugAvailableMessage("")
        form.clearErrors("slug")
        return
      }

      try {
        const result = await isCommunitySlugAvailable(slug, communityId)
        if (result && result.data) {
          if (onAvailable) onAvailable()
        } else {
          if (onNotAvailable) onNotAvailable()
        }
      } catch (error) {
        console.error("Error checking slug availability:", error)
        form.setError("slug", {
          type: "manual",
          message: "Error checking slug availability."
        })
        setSlugAvailableMessage("")
      }
    },
    1000
  )

  const handleTitleChange = (titleValue: string) => {
    setCurrentTitle(titleValue)

    const slug = (titleValue?.trim() || "").replaceAll(" ", "-").toLowerCase()

    const generatedSlug = slugify(slug)

    form.setValue("slug", generatedSlug)

    if (!titleValue.trim()) {
      setSlugAvailableMessage("")
      form.clearErrors("slug")
      return
    }

    if (
      editMode &&
      selectedCommunity &&
      generatedSlug === selectedCommunity.slug
    ) {
      setSlugAvailableMessage(`${generatedSlug} is your current community slug`)
      form.clearErrors("slug")
      return
    }

    debouncedCheckSlugAvailability(
      generatedSlug,
      selectedCommunity?.id,
      () => {
        form.clearErrors("slug")
        setSlugAvailableMessage(`${generatedSlug} is available`)
      },
      () => {
        form.setError("slug", {
          type: "manual",
          message: `${generatedSlug} is already taken`
        })
        setSlugAvailableMessage("")
      }
    )
  }

  useEffect(() => {
    if (selectedCommunity) {
      setEditMode(true)
      const title = selectedCommunity.title || ""
      setCurrentTitle(title)
      form.setValue("title", title)
      form.setValue("description", selectedCommunity.description || "")
      form.setValue("category", selectedCommunity.category_id || "")
      form.setValue("slug", selectedCommunity.slug || "")
      form.setValue(
        "type",
        selectedCommunity.type === "public" ? "public" : "private"
      )
      form.clearErrors("slug")
    } else {
      setEditMode(false)
      form.reset({
        title: "",
        slug: "",
        description: "",
        category: "",
        type: "public"
      })
      form.clearErrors()
      setSlugAvailableMessage("")
      setCurrentTitle("")
    }
  }, [selectedCommunity, form])
  useEffect(() => {
    if (!communityFormModalVisibility) {
      setSelectedCommunity(null)
    }
  }, [communityFormModalVisibility, setSelectedCommunity])

  async function communitySubmit(data: CommunityFormData) {
    if (!selectedCommunity) {
      await handleCreateCommunity(data)
    } else {
      await handleUpdateCommunity(data)
    }
  }

  async function handleCreateCommunity(data: CommunityFormData) {
    try {
      const payLoad: InsertCommunity = {
        title: data.title.trim(),
        description: data.description,
        category_id: data.category,
        slug: data.slug,
        type: data.type,
        created_by: authUser?.unique_id as string
      }

      const createdCommunity = await CreateCommunity(payLoad)

      if (createdCommunity?.success && createdCommunity?.data) {
        onCommunityCreated?.(createdCommunity.data)
        setSlugAvailableMessage("")
        setCurrentTitle("")
        form.reset({
          title: "",
          slug: "",
          description: "",
          category: "",
          type: "public"
        })
        setCommunities((prevCommunities) => {
          if (!prevCommunities) return null
          return {
            ...prevCommunities,
            communities: [...prevCommunities.communities, createdCommunity.data]
          }
        })

        setCommunityFormModalVisibility(false)
        setRefreshCommunitiesTrigger((prev) => !prev)

        toast({
          title: "Community Created",
          description: "Your community has been created successfully.",
          duration: 3000
        })
      } else {
        toast({
          title: "Error Creating Community",
          description: addCommunityError?.message || "Something went wrong.",
          variant: "destructive",
          duration: 3000
        })
      }
    } catch (error) {
      console.error("Failed to create community:", error)
      toast({
        title: "Unable to create community",
        variant: "destructive",
        duration: 3000
      })
    }
  }

  async function handleUpdateCommunity(
    updatedData: Partial<CommunityFormData>
  ) {
    try {
      if (!selectedCommunity?.id) {
        console.error("No selected community ID for update.")
        toast({
          title: "Error Updating Community",
          description: "No community selected for update.",
          variant: "destructive",
          duration: 3000
        })
        return
      }

      const payLoad: Partial<InsertCommunity> = {
        title: updatedData.title?.trim(),
        description: updatedData.description,
        category_id: updatedData.category,
        slug: updatedData.slug,
        type: updatedData.type
      }

      const updatedCommunity = await UpdateCommunity(
        selectedCommunity.id,
        payLoad
      )

      if (updatedCommunity?.success && updatedCommunity.data) {
        setCommunities((currentCommunities) => {
          if (!currentCommunities) return null
          return {
            ...currentCommunities,
            communities: currentCommunities.communities.map((community) =>
              community.id === selectedCommunity.id
                ? { ...community, ...updatedCommunity.data }
                : community
            ),
            joinedCommunities: currentCommunities.joinedCommunities.map(
              (community) =>
                community.id === selectedCommunity.id
                  ? { ...community, ...updatedCommunity.data }
                  : community
            )
          }
        })

        setCommunityFormModalVisibility(false)
        setRefreshCommunitiesTrigger((prev) => !prev)

        toast({
          title: "Community updated",
          description: "Your community successfully updated.",
          duration: 3000
        })
      } else {
        toast({
          title: "Error Updating Community",
          description:
            addUpdateCommunityError?.message || "Something went wrong.",
          variant: "destructive",
          duration: 3000
        })
      }
    } catch (error) {
      console.error("Failed to update community:", error)
      toast({
        title: "Unable to update community",
        variant: "destructive",
        duration: 3000
      })
    }
  }

  return (
    <Dialog
      open={communityFormModalVisibility}
      onOpenChange={(open) => {
        setCommunityFormModalVisibility(open)
      }}
    >
      <DialogContent className="max-w-[95vw] sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {editMode === true ? "Edit Community" : "Create Community"}
          </DialogTitle>
          <DialogDescription>
            {editMode === true
              ? "You can edit your community details."
              : "Create a new community for users to join and interact."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(communitySubmit)}>
          <div className="grid gap-4 py-4">
            {/* Community Name (Title) */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <Label htmlFor="title">Community Name</Label>
                <div className="w-[70%]">
                  <Controller
                    name="title"
                    defaultValue=""
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        id="title"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                          handleTitleChange(e.target.value)
                        }}
                      />
                    )}
                  />
                </div>
              </div>
              <div className="text-left flex items-center gap-x-2 pt-1 pl-[30%]">
                {error.title && (
                  <span className="text-red-500 text-sm">
                    {String(error.title.message)}
                  </span>
                )}
              </div>
            </div>

            {/* Community Slug */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <Label htmlFor="slug">Community Slug</Label>
                <div className="w-[70%]">
                  <Controller
                    name="slug"
                    defaultValue=""
                    control={form.control}
                    render={({ field }) => (
                      <Input id="slug" {...field} disabled={true} />
                    )}
                  />
                </div>
              </div>
              <div className="text-left flex items-center gap-x-2 pt-1 pl-[30%]">
                {error.slug && !isSlugAvailableLoading && (
                  <div className="flex items-center text-red-500">
                    <CircleXIcon className="mr-2 h-4 w-4" />
                    <span className="text-sm">
                      {String(error.slug.message)}
                    </span>
                  </div>
                )}
                {isSlugAvailableLoading && (
                  <>
                    <Loader size={LoaderSizes.sm} />
                    <span className="text-gray-500 text-sm">
                      Checking slug availability
                    </span>
                  </>
                )}
                {slugAvailableMessage &&
                  !isSlugAvailableLoading &&
                  !error.slug && (
                    <div className="flex items-center gap-x-1 text-green-500">
                      <CircleCheck className="mr-2 h-4 w-4" />
                      <span className="text-sm">{slugAvailableMessage}</span>
                    </div>
                  )}
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Description</Label>
                <div className="w-[70%]">
                  <Controller
                    name="description"
                    control={form.control}
                    render={({ field }) => {
                      const charCount = field.value?.length || 0
                      const maxChars = 150
                      return (
                        <>
                          <Textarea
                            id="description"
                            {...field}
                            maxLength={maxChars}
                          />
                          <div className="text-sm text-muted-foreground text-right mt-1">
                            {charCount}/{maxChars} characters
                          </div>
                        </>
                      )
                    }}
                  />
                </div>
              </div>
              <div className="text-left flex items-center gap-x-2 pt-1 pl-[30%]">
                {error.description && (
                  <span className="text-red-500 text-sm">
                    {String(error.description.message)}
                  </span>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <Label htmlFor="category">Category</Label>
                <div className="w-[70%]">
                  <Controller
                    name="category"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              <div className="text-left flex items-center gap-x-2 pt-1 pl-[30%]">
                {error.category && (
                  <span className="text-red-500 text-sm">
                    {String(error.category.message)}
                  </span>
                )}
              </div>
            </div>

            {/* Community Type (Public/Private) Select */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between">
                <Label htmlFor="type">Community Type</Label>
                <div className="w-[70%]">
                  <Controller
                    name="type"
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              <div className="text-left flex items-center gap-x-2 pt-1 pl-[30%]">
                {error.type && (
                  <span className="text-red-500 text-sm">
                    {String(error.type.message)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            {editMode === true ? (
              <Button
                type="submit"
                loading={addUpdateCommunityLoading}
                disabled={!!error.slug?.message || isSlugAvailableLoading}
              >
                Save Changes
              </Button>
            ) : (
              <Button
                type="submit"
                loading={addCommunityLoading}
                disabled={!!error.slug?.message || isSlugAvailableLoading}
              >
                Create Community
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
