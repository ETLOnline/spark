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
import { Switch } from "@/src/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/src/components/ui/alert-dialog"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
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
  communityCoverImageAction,
  CreateCommunityAction,
  IsCommunitySlugAvailableAction,
  UpdateCommunityAction
} from "@/src/server-actions/Community/Community"
import { communityStore } from "@/src/store/community/communityStore"
import { CommunityCategory } from "@/src/db/data-access/communities/query"
import { slugify } from "@/src/utils/helpers"
import { ScrollArea } from "../ui/scroll-area"
import { UnsavedChangesDialog } from "../common/unsavedChangesDialog"
import { useConfirmClose } from "@/src/hooks/useConfirmClose"

const communitySchema = z.object({
  title: z
    .string()
    .min(1, "Community name required")
    .max(50, "Community name is too long"),
  description: z
    .string()
    .min(1, "Description required")
    .max(150, "Description is too long"),
  category: z.string().min(1, "Category required"),
  slug: z.string().max(50, "Slug is too long"),
  type: z.string().min(1, "Community type required"),
  cover_image: z.string().optional(),
  is_FYP_enable: z.boolean().optional()
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
  const [communityCoverImage, setCommunityCoverImage] = useState<File | null>(
    null
  )
  const [coverImgPreview, setCoverImgPreview] = useState<string | null>(null)
  const [showFypConfirm, setShowFypConfirm] = useState<boolean>(false)

  const [communities, setCommunities] = useAtom(communityStore.communities)
  const authUser = useAtomValue(userStore.AuthUser)
  const [communityFormModalVisibility, setCommunityFormModalVisibility] =
    useAtom(communityStore.communityFormModalVisibility)
  const [selectedCommunity, setSelectedCommunity] = useAtom(
    communityStore.selectedCommunity
  )
  const { canAccess } = usePermissionChecker(
    "scoped",
    "COMMUNITY",
    selectedCommunity?.id
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
  const [coverImageLoading, , , CoverImage] = useServerAction(
    communityCoverImageAction
  )

  const { toast } = useToast()

  const form = useForm<CommunityFormData>({
    resolver: zodResolver(communitySchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      slug: "",
      type: undefined,
      is_FYP_enable: false
    }
  })

  const error = form.formState.errors
  const isChanged = form.formState.isDirty

  useEffect(() => {
    if (!communityFormModalVisibility) {
      form.reset({
        title: "",
        slug: "",
        description: "",
        category: "",
        type: "",
        is_FYP_enable: false
      })
      setCommunityCoverImage(null)
      setCoverImgPreview(null)
    }
  }, [communityFormModalVisibility])

  const handleTitleChange = (titleValue: string) => {
    setCurrentTitle(titleValue)
    debouncedCheckSlugAvailability(titleValue, selectedCommunity?.id)
  }

  const debouncedCheckSlugAvailability = useDebouncedCallback(
    async (titleValue: string, communityId: string | undefined) => {
      const trimmedTitle = titleValue.trim()
      if (trimmedTitle.length === 0) {
        form.setValue("slug", "")
        setSlugAvailableMessage("")
        form.clearErrors("slug")
        return
      }

      const generatedSlug = slugify(trimmedTitle)
      form.setValue("slug", generatedSlug)

      if (
        editMode &&
        selectedCommunity &&
        generatedSlug === selectedCommunity.slug
      ) {
        setSlugAvailableMessage(
          `${generatedSlug} is your current community slug`
        )
        form.clearErrors("slug")
        return
      }

      try {
        const result = await isCommunitySlugAvailable(
          generatedSlug,
          communityId
        )
        if (result && result.data) {
          setSlugAvailableMessage(`${generatedSlug} is available`)
          form.clearErrors("slug")
        } else {
          form.setError("slug", {
            type: "manual",
            message: `${generatedSlug} is already taken`
          })
          setSlugAvailableMessage("")
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

  useEffect(() => {
    if (communityCoverImage) {
      const url = URL.createObjectURL(communityCoverImage)
      setCoverImgPreview(url)
    } else {
      setCoverImgPreview(null)
    }
  }, [communityCoverImage])

  useEffect(() => {
    if (selectedCommunity) {
      setEditMode(true)
      const title = selectedCommunity.title || ""
      setCurrentTitle(title)
      form.setValue("title", title)
      form.setValue("description", selectedCommunity.description || "")
      form.setValue("cover_image", selectedCommunity.cover_image || "")
      form.setValue("category", selectedCommunity.category_id || "")
      form.setValue("slug", selectedCommunity.slug || "")
      form.setValue(
        "type",
        selectedCommunity.type === "public" ? "public" : "private"
      )
      form.setValue("is_FYP_enable", !!selectedCommunity.is_FYP_enable)
      setCoverImgPreview(selectedCommunity.cover_image)
      form.clearErrors("slug")
    } else {
      setEditMode(false)
      form.reset({
        title: "",
        slug: "",
        description: "",
        category: "",
        type: "",
        is_FYP_enable: false
      })
      form.clearErrors()
      setSlugAvailableMessage("")
      setCurrentTitle("")
    }
  }, [selectedCommunity, form])
  useEffect(() => {
    if (!communityFormModalVisibility) {
      setSelectedCommunity(null)
      setCoverImgPreview(null)
    }
  }, [communityFormModalVisibility, setSelectedCommunity])

  async function communitySubmit(data: CommunityFormData) {
    if (!selectedCommunity) {
      await handleCreateCommunity(data)
    } else {
      await handleUpdateCommunity(data)
    }
  }
  const [url, seturl] = useState<string | null>(null)

  async function handleUploadCoverImage() {
    if (!communityCoverImage) return null

    const reader = new FileReader()
    const base64 = await new Promise((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(communityCoverImage)
    })

    try {
      const res = await CoverImage(
        communityCoverImage.name,
        base64 as string,
        communityCoverImage.type
      )
      if (res?.success && res?.data) {
        return res.data
      }
      return null
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong while uploading the cover image.",
        duration: 3000
      })
      return null
    }
  }

  async function handleCreateCommunity(data: CommunityFormData) {
    try {
      let coverImageUrl = null
      if (communityCoverImage) {
        coverImageUrl = await handleUploadCoverImage()
      }
      const payLoad: InsertCommunity = {
        title: data.title.trim(),
        description: data.description,
        category_id: data.category,
        slug: data.slug,
        type: data.type,
        created_by: authUser?.unique_id as string,
        cover_image: coverImageUrl,
        is_FYP_enable: data.is_FYP_enable ?? false
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
      let coverImageUrl = null
      if (communityCoverImage) {
        coverImageUrl = await handleUploadCoverImage()
      }

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
        type: updatedData.type,
        cover_image: coverImageUrl || updatedData?.cover_image,
        is_FYP_enable: updatedData.is_FYP_enable ?? false
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

  const { showConfirmation, setShowConfirmation, handleClose } =
    useConfirmClose({
      isDirty: isChanged,
      onClose: () => setCommunityFormModalVisibility(false)
    })

  return (
    <>
      <Dialog open={communityFormModalVisibility} onOpenChange={handleClose}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
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
          <ScrollArea className="h-[80vh] w-full pr-4">
            <form onSubmit={form.handleSubmit(communitySubmit)}>
              <div className="grid gap-4 py-4">
                {/* Community Name (Title) */}
                <div className="flex flex-col gap-1">
                  <div className="flex flex-col gap-3 justify-between">
                    <Label htmlFor="title">Community Name</Label>
                    <div className="w-full">
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
                            placeholder="Enter community name"
                          />
                        )}
                      />
                    </div>
                  </div>
                  <div className="text-left ">
                    {error.title && (
                      <span className="text-red-500 text-sm">
                        {String(error.title.message)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Community Slug */}
                <div className="flex flex-col gap-1">
                  <div className="flex flex-col gap-3 justify-between">
                    <Label htmlFor="slug">Community Slug</Label>
                    <div className="w-full">
                      <Controller
                        name="slug"
                        defaultValue=""
                        control={form.control}
                        render={({ field }) => (
                          <Input
                            id="slug"
                            {...field}
                            disabled={true}
                            placeholder="community-slug"
                          />
                        )}
                      />
                    </div>
                  </div>
                  <div className="text-left">
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
                          <span className="text-sm">
                            {slugAvailableMessage}
                          </span>
                        </div>
                      )}
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1">
                  <div className="flex flex-col gap-3 justify-between">
                    <Label htmlFor="description">Description</Label>
                    <div className="w-full">
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
                                placeholder="Description"
                              />
                              <div className="flex justify-between items-center text-sm text-muted-foreground mt-1">
                                {error.description && (
                                  <span className="text-red-500 text-sm">
                                    {String(error.description.message)}
                                  </span>
                                )}
                                <span className="ml-auto">
                                  {charCount}/{maxChars} characters
                                </span>
                              </div>
                            </>
                          )
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Cover image */}
                <div className="flex flex-col gap-1">
                  <div className="flex flex-col gap-3 justify-between">
                    <Label htmlFor="cover_image">
                      {"Cover Image (Optional)"}
                    </Label>
                    <div className="w-full">
                      <Controller
                        name="cover_image"
                        control={form.control}
                        render={({ field }) => (
                          <Input
                            id="cover_image"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null
                              setCommunityCoverImage(file)
                            }}
                            type="file"
                            accept="image/*"
                            placeholder="Upload a cover image"
                          />
                        )}
                      />
                      {coverImgPreview && (
                        <div className=" rounded-md overflow-hidden">
                          <img
                            src={coverImgPreview}
                            alt="Cover Preview"
                            className="object-fill w-full h-auto mt-4"
                          />
                          <div className="w-full">
                            <Button
                              variant="destructive"
                              className="float-right mt-2"
                              onClick={() => {
                                setCommunityCoverImage(null)
                                setCoverImgPreview(null)
                                form.setValue("cover_image", "")
                              }}
                            >
                              Remove Image
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div className="flex flex-col gap-1">
                  <div className="flex flex-col gap-3 justify-between">
                    <Label htmlFor="category">Category</Label>
                    <div className="w-full">
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
                  <div className="text-left">
                    {error.category && (
                      <span className="text-red-500 text-sm">
                        {String(error.category.message)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Community Type (Public/Private) Select */}
                <div className="flex flex-col gap-1">
                  <div className="flex flex-col gap-3 justify-between">
                    <Label htmlFor="type">Community Type</Label>
                    <div className="w-full">
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
                  <div className="text-left">
                    {error.type && (
                      <span className="text-red-500 text-sm">
                        {String(error.type.message)}
                      </span>
                    )}
                  </div>
                </div>

                {/* FYP Toggle */}
                {(!editMode || canAccess("community.update")) && (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="is_FYP_enable">Enable FYP</Label>
                      <Controller
                        name="is_FYP_enable"
                        control={form.control}
                        render={({ field }) => (
                          <Switch
                            id="is_FYP_enable"
                            checked={!!field.value}
                            disabled={
                              editMode && !!selectedCommunity?.is_FYP_enable
                            }
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setShowFypConfirm(true)
                              } else {
                                field.onChange(false)
                              }
                            }}
                          />
                        )}
                      />
                    </div>
                    {editMode && selectedCommunity?.is_FYP_enable ? (
                      <span className="text-xs text-muted-foreground">
                        FYP is permanently enabled for this community.
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
              <DialogFooter>
                {editMode === true ? (
                  <Button
                    type="submit"
                    loading={addUpdateCommunityLoading}
                    disabled={
                      !!error.slug?.message ||
                      isSlugAvailableLoading ||
                      addUpdateCommunityLoading ||
                      coverImageLoading
                    }
                  >
                    Save Changes
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    loading={addCommunityLoading || coverImageLoading}
                    disabled={
                      !!error.slug?.message ||
                      isSlugAvailableLoading ||
                      coverImageLoading ||
                      addCommunityLoading
                    }
                  >
                    Create Community
                  </Button>
                )}
              </DialogFooter>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <UnsavedChangesDialog
        showConfirmation={showConfirmation}
        setShowConfirmation={setShowConfirmation}
        setIsActualDialogOpen={setCommunityFormModalVisibility}
      />

      <AlertDialog open={showFypConfirm} onOpenChange={setShowFypConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enable FYP</AlertDialogTitle>
            <AlertDialogDescription>
              Once the FYP feature is enabled it cannot be disabled again. You
              can disable it in each space individually at the time of creating
              a space or in space settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                form.setValue("is_FYP_enable", true, { shouldDirty: true })
                setShowFypConfirm(false)
              }}
            >
              Enable FYP
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
