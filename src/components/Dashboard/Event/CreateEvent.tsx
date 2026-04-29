"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../../ui/dialog"
import { Label } from "../../ui/label"
import { Input } from "../../ui/input"
import { Textarea } from "../../ui/textarea"
import { Button } from "../../ui/button"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  CreateEventAction,
  DeleteEventAction,
  UpdateEventsAction,
  UploadEventImageAction
} from "@/src/server-actions/events/event"
import { useAtomValue, useSetAtom } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "../../ui/alert-dialog"
import { AlertDialogTrigger } from "@radix-ui/react-alert-dialog"
import { useToast } from "@/src/hooks/use-toast"
import { z } from "zod"
import moment from "moment"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../../ui/select"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { eventStore } from "@/src/store/event/eventStore"
import TagSelect from "../../TagsInput/tags"
import { InsertEvent, SelectEvent } from "@/src/db/schema"
import { EventType } from "../../common/types/event.types"
import { MultiSelectOption } from "../../ui/multi-select"
import { ScrollArea } from "../../ui/scroll-area"
import { UnsavedChangesDialog } from "../../common/unsavedChangesDialog"
import { useConfirmClose } from "@/src/hooks/useConfirmClose"
import { hostStore } from "@/src/store/host/hostStore"
interface Props {
  events: SelectEvent[]
  setEvents: React.Dispatch<React.SetStateAction<SelectEvent[]>>
}

const now = moment().format("YYYY-MM-DD HH:mm")
const eventSchema = z
  .object({
    title: z
      .string()
      .min(1, "Event name required")
      .max(30, "Event name is too long"),
    description: z
      .string()
      .min(1, "Description required")
      .max(150, "Description is too long"),
    image: z.any().optional(),
    existingImageUrl: z.string().optional(),

    start_date_time: z.string().min(1, "Start date and time required"),
    end_date_time: z.string().min(1, "End date and time required"),
    event_type: z.string().min(1, "Type required"),
    location: z.string().optional(),
    meeting_link: z.string().optional()
  })
  .superRefine((data, ctx) => {
    if (!data.existingImageUrl && !(data.image instanceof File)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["image"],
        message: "Image is required"
      })
    }

    if (data.image instanceof File && data.image.size <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["image"],
        message: "Image cannot be empty"
      })
    }
    if (new Date(data.start_date_time) <= new Date(now)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["start_date_time"],
        message: "Start date and time must be current date and time or later"
      })
    }

    if (new Date(data.end_date_time) <= new Date(data.start_date_time)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end_date_time"],
        message: "End date and time must be after the start date and time"
      })
    }
    if (data.event_type === EventType.Physical && !data.location) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["location"],
        message: "Location required"
      })
    }
    if (data.event_type === EventType.Virtual && !data.meeting_link) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["meeting_link"],
        message: "Meeting Link  required"
      })
    }
    if (data.event_type === EventType.Hybrid) {
      if (!data.location) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["location"],
          message: "Location required"
        })
      }
      if (!data.meeting_link) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["meeting_link"],
          message: "Meeting Link is required"
        })
      }
    }
    if (
      data.meeting_link &&
      !z.string().url().safeParse(data.meeting_link).success
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["meeting_link"],
        message: "Invalid URL"
      })
    }
  })

export const CreateEvent = ({ events, setEvents }: Props) => {
  const [editEvent, setEditEvent] = useState(false)
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [selectedTags, setSelectedTags] = useState<MultiSelectOption[]>([])
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState<string>("")
  const form = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      start_date_time: moment().format("YYYY-MM-DDTHH:mm"),
      end_date_time: moment().add(1, "hours").format("YYYY-MM-DDTHH:mm"),
      event_type: "",
      location: "",
      meeting_link: "",
      image: undefined,
      existingImageUrl
    },
    shouldUnregister: true
  })
  const selectedEvent = useAtomValue(eventStore.selectedEvent)
  const setSelectedEvent = useSetAtom(eventStore.selectedEvent)
  const formModalVisibility = useAtomValue(eventStore.formModalVisibility)
  const setFormModalVisibility = useSetAtom(eventStore.formModalVisibility)

  const [addEventLoading, addEventError, addEventData, CreateEvent] =
    useServerAction(CreateEventAction)
  const [
    addUpdatedEventLoading,
    addUpdatedEventData,
    addUpdatedEventError,
    UpdateEvents
  ] = useServerAction(UpdateEventsAction)
  const [
    addDeleteEventLoading,
    addDeleteEventData,
    addDeleteEventError,
    DeleteEvent
  ] = useServerAction(DeleteEventAction)
  const [eventImageLoading, eventImageData, eventImageError, uploadCoverImage] =
    useServerAction(UploadEventImageAction)
  const authUser = useAtomValue(userStore.AuthUser)
  const { toast } = useToast()

  const EventTypeSelection = form.watch("event_type")
  const { setValue, clearErrors } = form

  useEffect(() => {
    if (EventTypeSelection === EventType.Physical) {
      setValue("meeting_link", "")
      clearErrors("meeting_link")
    } else if (EventTypeSelection === EventType.Virtual) {
      setValue("location", "")
      clearErrors("location")
    }
  }, [setValue, clearErrors])

  useEffect(() => {
    if (selectedEvent) {
      const selesctedEventCopy = { ...selectedEvent }
      selesctedEventCopy.start_date_time = moment
        .utc(selesctedEventCopy.start_date_time)
        .local()
        .format("YYYY-MM-DD HH:mm")
      selesctedEventCopy.end_date_time = moment
        .utc(selesctedEventCopy.end_date_time)
        .local()
        .format("YYYY-MM-DD HH:mm")
      const metadata = JSON.parse(selesctedEventCopy.metadata || "{}")
      form.setValue("title", selesctedEventCopy.title)
      form.setValue("description", selesctedEventCopy?.description || "")
      form.setValue("start_date_time", selesctedEventCopy.start_date_time)
      form.setValue("end_date_time", selesctedEventCopy.end_date_time)
      form.setValue("event_type", selesctedEventCopy?.type || EventType.Hybrid)
      form.setValue("location", metadata.location)
      form.setValue("meeting_link", metadata.meeting_link)
      setExistingImageUrl(selesctedEventCopy.coverImage || "")
      setImageFile(null)
    }
  }, [selectedEvent])

  useEffect(() => {
    if (!formModalVisibility) {
      form.reset({
        title: "",
        description: "",
        start_date_time: moment().format("YYYY-MM-DDTHH:mm"),
        end_date_time: moment().add(1, "hours").format("YYYY-MM-DDTHH:mm"),
        event_type: "",
        location: "",
        meeting_link: "",
        image: undefined
      })
      setSelectedEvent(null)
      setImageFile(null) // Clear image file when modal is closed
      setExistingImageUrl("")
    }
  }, [formModalVisibility])

  useEffect(() => {
    if (selectedEvent != null) {
      setEditEvent(true)
    } else {
      setEditEvent(false)
    }
  }, [selectedEvent])

  const error = form.formState.errors
  const isChanged = form.formState.isDirty
  const isSubmitting = form.formState.isSubmitting

  async function eventSubmit(data: any) {
    const metadata = JSON.stringify({
      location: data.location?.toUpperCase() || "",
      meeting_link: data.meeting_link
    })

    const tags = selectedTags.map((tag) => tag.label)
    let coverImageUrl = selectedEvent?.coverImage
    if (imageFile instanceof File) {
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(imageFile)
        })

        // Upload the image
        const uploadResult = await uploadCoverImage(
          imageFile.name,
          base64,
          imageFile.type
        )

        if (uploadResult?.success && uploadResult.data) {
          coverImageUrl = uploadResult.data
          toast({
            title: "Event cover image uploaded!",
            description:
              "Your event cover image has been successfully uploaded.",
            duration: 3000
          })
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description:
              uploadResult?.error || "Failed to upload event cover image",
            duration: 3000
          })
          return
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Something went wrong while uploading cover image",
          duration: 3000
        })
        return
      }
    }

    const finalEventData: Partial<SelectEvent> = {
      title: data.title,
      description: data.description,
      start_date_time: data.start_date_time,
      end_date_time: data.end_date_time,
      type: data.event_type,
      tags: tags,
      metadata: metadata,
      coverImage: coverImageUrl || undefined
    }

    if (!selectedEvent) {
      await handleCreateEvent(finalEventData)
    }

    if (selectedEvent) {
      await handleUpdateEvent(finalEventData)
    }
  }

  async function handleCreateEvent(finalEventData: any) {
    try {
      const payLoad = { ...finalEventData }
      payLoad.start_date_time = moment(
        finalEventData.start_date_time
      ).toISOString()
      payLoad.end_date_time = moment(finalEventData.end_date_time).toISOString()
      payLoad.host_id = authUser?.unique_id

      const createdEvent = await CreateEvent(payLoad as InsertEvent)
      if (createdEvent?.success && createdEvent.data) {
        setEvents([...events, createdEvent.data])
        setFormModalVisibility(false)
        setSelectedTags([])
        setImageFile(null)
        form.reset()
        toast({
          title: "Event created",
          description: "Your event has been created successfully.",
          duration: 3000
        })
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        setFormErrors(
          Object.fromEntries(
            error.errors.map((error) => [error.path[0], error.message])
          )
        )
      }
    }
  }

  async function handleUpdateEvent(finalEventData: Partial<SelectEvent>) {
    const updateEvent = { ...finalEventData }
    updateEvent.start_date_time = moment(finalEventData.start_date_time)
      .utc()
      .toISOString()
    updateEvent.end_date_time = moment(finalEventData.end_date_time)
      .utc()
      .toISOString()
    if (!selectedEvent?.id) return
    const updatedEvent = await UpdateEvents(selectedEvent?.id, updateEvent)
    if (updatedEvent?.success && updatedEvent.data) {
      setEvents((Events) =>
        Events.map((event) =>
          event.id === selectedEvent.id ? updatedEvent.data : event
        )
      )
      setFormModalVisibility(false)
      setSelectedTags([])
      setImageFile(null)
      setExistingImageUrl("")
      form.reset()
      toast({
        title: "Event updated",
        description: "Your changes have been saved successfully.",
        duration: 3000
      })
    } else {
      toast({
        title: "Unable to update event",
        variant: "destructive",
        duration: 3000
      })
    }
  }

  async function handleDeleteEvent() {
    const deletedEvent = await DeleteEvent(selectedEvent as SelectEvent)
    if (deletedEvent?.success) {
      setEvents((Events) =>
        Events.filter((event) => event.id !== selectedEvent?.id)
      )
      setFormModalVisibility(false)
      toast({
        title: "Event deleted."
      })
    }
  }
  useEffect(() => {
    form.setValue("existingImageUrl", existingImageUrl)
  }, [existingImageUrl, form])

  const { showConfirmation, setShowConfirmation, handleClose } =
    useConfirmClose({
      isDirty: isChanged,
      onClose: () => setFormModalVisibility(false)
    })
  return (
    <>
      <Dialog open={formModalVisibility} onOpenChange={handleClose}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>
              {editEvent === true ? "Edit event" : "Create a new event"}
            </DialogTitle>
            <DialogDescription>
              {editEvent === true
                ? "Fill in the details to edit your event"
                : "Fill in the details for your new event."}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[80vh] w-full pr-4">
            <form onSubmit={form.handleSubmit(eventSubmit)}>
              <div className="grid gap-4 py-4 ">
                <div className="flex flex-col">
                  <div className="flex flex-col gap-2 justify-between">
                    <Label htmlFor="title">Enter Event Name</Label>
                    <Controller
                      name="title"
                      control={form.control}
                      defaultValue=""
                      render={({ field }) => (
                        <Input
                          id="title"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.value.trimStart())
                          }
                          className="col-span-3"
                          placeholder="Enter event name"
                        />
                      )}
                    />
                  </div>
                  <div className="text-left">
                    {error.title && (
                      <span className="text-red-500 text-sm">
                        {String(error.title?.message)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="flex flex-col gap-2 justify-between">
                    <Label htmlFor="description">Description</Label>
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
                              onChange={(e) =>
                                field.onChange(e.target.value.trimStart())
                              }
                              className="col-span-3"
                              maxLength={maxChars}
                              placeholder="Description"
                            />
                            <div className="flex justify-between items-center text-sm text-muted-foreground ">
                              {error.description && (
                                <span className="text-red-500 text-sm">
                                  {String(error.description.message)}
                                </span>
                              )}
                              <span className="ml-auto">
                                {/* characters */}
                                {charCount}/{maxChars} characters
                              </span>
                            </div>
                          </>
                        )
                      }}
                    />
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="flex flex-col gap-2 justify-between">
                    <Label htmlFor="image">Event Image</Label>
                    <Controller
                      name="image"
                      control={form.control}
                      render={({ field: { onChange, value, ...field } }) => (
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null
                            setImageFile(file)
                            onChange(file)
                          }}
                          className="col-span-3"
                          {...field}
                          value={undefined} // File inputs don't use value prop
                        />
                      )}
                    />
                  </div>
                  <div className="text-left">
                    {error.image && (
                      <span className="text-red-500 text-sm">
                        {String(error.image.message)}
                      </span>
                    )}
                  </div>
                </div>
                {(existingImageUrl || imageFile) && (
                  <div className="flex justify-center my-4">
                    <img
                      src={
                        imageFile
                          ? URL.createObjectURL(imageFile)
                          : existingImageUrl!
                      }
                      alt="Event Preview"
                      className="max-h-64 object-cover rounded-md"
                    />
                  </div>
                )}
                <div className="flex flex-col">
                  <div className="flex flex-col gap-2 justify-between">
                    <Label htmlFor="start_date_time">Start Date and Time</Label>
                    <Controller
                      name="start_date_time"
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          id="start_date_time"
                          type="datetime-local"
                          {...field}
                          className="col-span-3 "
                        />
                      )}
                    />
                  </div>
                  <div className="text-left">
                    {error.start_date_time && (
                      <span className="text-red-500 text-sm">
                        {String(error.start_date_time.message)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="flex flex-col gap-2 justify-between">
                    <Label htmlFor="end_date_time">End Date and Time</Label>
                    <Controller
                      name="end_date_time"
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          id="end_date_time"
                          type="datetime-local"
                          {...field}
                          className="col-span-3 "
                        />
                      )}
                    />
                  </div>
                  <div className="text-left">
                    {error.end_date_time && (
                      <span className="text-red-500 text-sm">
                        {String(error.end_date_time.message)}
                      </span>
                    )}
                  </div>
                </div>

                {/* select tags */}

                <div className="flex flex-col">
                  <div className="flex flex-col gap-2 justify-between">
                    <Label htmlFor="tags">Tags</Label>
                    <div className="col-span-3">
                      <TagSelect
                        type="interest"
                        selected={selectedTags}
                        setSelected={setSelectedTags}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="flex flex-col gap-2 justify-between">
                    <Label htmlFor="type">Select Type</Label>
                    <Controller
                      name="event_type"
                      control={form.control}
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={EventType.Physical}>
                              Physical
                            </SelectItem>
                            <SelectItem value={EventType.Virtual}>
                              Virtual
                            </SelectItem>
                            <SelectItem value={EventType.Hybrid}>
                              Hybrid
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  <div className="text-left">
                    {error.event_type && (
                      <span className="text-red-500 text-sm">
                        {String(error.event_type.message)}
                      </span>
                    )}
                  </div>
                </div>

                {(EventTypeSelection === EventType.Physical ||
                  EventTypeSelection === EventType.Hybrid) && (
                  <div className="flex flex-col">
                    <div className="flex flex-col gap-2 justify-between">
                      <Label htmlFor="location">Location</Label>
                      <Controller
                        name="location"
                        control={form.control}
                        defaultValue=""
                        render={({ field }) => (
                          <Input
                            id="location"
                            {...field}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value.toUpperCase().trimStart()
                              )
                            }
                            className="col-span-3"
                          />
                        )}
                      />
                    </div>
                    <div className="text-left">
                      {error.location && (
                        <span className="text-red-500 text-sm">
                          {String(error.location.message)}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {(EventTypeSelection === EventType.Virtual ||
                  EventTypeSelection === EventType.Hybrid) && (
                  <div className="flex flex-col">
                    <div className="flex flex-col gap-2 justify-between">
                      <Label htmlFor="meeting_link">Meeting Link</Label>
                      <Controller
                        name="meeting_link"
                        control={form.control}
                        defaultValue=""
                        render={({ field }) => (
                          <Input
                            id="meeting_link"
                            {...field}
                            className="col-span-3"
                          />
                        )}
                      />
                    </div>
                    <div className="text-left">
                      {error.meeting_link && (
                        <span className="text-red-500 text-sm">
                          {String(error.meeting_link.message)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="flex justify-between">
                {editEvent === true ? (
                  <>
                    <AlertDialog>
                      <AlertDialogTrigger asChild className="mr-auto">
                        <Button
                          type="button"
                          loading={addDeleteEventLoading}
                          variant="destructive"
                        >
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Event?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete your event?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            type="button"
                            onClick={handleDeleteEvent}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button
                      loading={isSubmitting || addUpdatedEventLoading}
                      disabled={isSubmitting || addUpdatedEventLoading}
                      type="submit"
                    >
                      Save
                    </Button>
                  </>
                ) : (
                  <Button
                    type="submit"
                    loading={isSubmitting || addEventLoading}
                    disabled={isSubmitting || addEventLoading}
                  >
                    Create Event
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
        setIsActualDialogOpen={setFormModalVisibility}
      />
    </>
  )
}

export default CreateEvent
