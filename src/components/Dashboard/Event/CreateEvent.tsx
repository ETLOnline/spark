import React, { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "../../ui/dialog"
import { Label } from "../../ui/label"
import { Input } from "../../ui/input"
import { Textarea } from "../../ui/textarea"
import { Button } from "../../ui/button"
import { InsertEvent, SelectEvent } from "@/src/db/schema"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  CreateEventAction,
  DeleteEventAction,
  UpdateEventsAction
} from "@/src/server-actions/events/event"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
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
import { EventType } from "../../common/Loader/types/event.types"

interface Props {
  events: SelectEvent[]
  setEvents: React.Dispatch<React.SetStateAction<SelectEvent[]>>
}

const now = moment().format("YYYY-MM-DD HH:mm")
const eventSchema = z
  .object({
    title: z.string().min(1, "Title required").max(30, "Title is too long"),
    description: z
      .string()
      .min(1, "Description required")
      .max(50, "Description is too long"),
    start_date_time: z.string().min(1, "Start date and time required"),
    end_date_time: z.string().min(1, "End date and time required"),
    event_type: z.string().min(1, "Type required"),
    location: z.string().optional(),
    meeting_link: z.string().optional()
  })
  .superRefine((data, ctx) => {
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
        message: "location required"
      })
    }
    if (data.event_type === EventType.Virtual && !data.meeting_link) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["meeting_link"],
        message: "Meeting Link  required"
      })
    }
    if (data.event_type === EventType.Both) {
      if (!data.location) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["location"],
          message: "location required"
        })
      }
      if (!data.meeting_link && z.string().url()) {
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
  const form = useForm({
    resolver: zodResolver(eventSchema),
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
      form.setValue("event_type", selesctedEventCopy?.type || EventType.Both)
      form.setValue("location", metadata.location)
      form.setValue("meeting_link", metadata.meeting_link)
    }
  }, [selectedEvent])

  useEffect(() => {
    if (!formModalVisibility) {
      setSelectedEvent(null)
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

  async function eventSubmit(data: any) {
    const metadata = JSON.stringify({
      location: data.location?.toUpperCase() || "",
      meeting_link: data.meeting_link
    })

    const finalEventData: Partial<SelectEvent> = {
      title: data.title,
      description: data.description,
      start_date_time: data.start_date_time,
      end_date_time: data.end_date_time,
      type: data.event_type,
      metadata: metadata
    }

    if (!selectedEvent) {
      handleCreateEvent(finalEventData)
    }

    if (selectedEvent) {
      handleUpdateEvent(finalEventData)
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
        toast({
          title: "Event created",
          description: "Your evnet has been created successfully.",
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
    {
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

  return (
    <Dialog
      open={formModalVisibility}
      onOpenChange={(open) => {
        setFormModalVisibility(open)
      }}
    >
      <DialogTrigger asChild>
        <button className="p-1 relative w-max mb-2">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
          <div className="px-8 py-2  bg-primary rounded-[6px]  relative group transition duration-200 text-primary-foreground hover:bg-transparent">
            Add Event
          </div>
        </button>
      </DialogTrigger>
      <DialogContent>
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
        <form onSubmit={form.handleSubmit(eventSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
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
                    />
                  )}
                />
              </div>
              <div className="text-right">
                {error.title && (
                  <span className="text-red-500 text-sm">
                    {String(error.title?.message)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Controller
                  name="description"
                  control={form.control}
                  render={({ field }) => (
                    <Textarea
                      id="description"
                      {...field}
                      onChange={(e) =>
                        field.onChange(e.target.value.trimStart())
                      }
                      className="col-span-3"
                    />
                  )}
                />
              </div>
              <div className="text-right">
                {error.description && (
                  <span className="text-red-500 text-sm">
                    {String(error.description.message)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="start_date_time" className="text-right">
                  start Date and Time
                </Label>
                <Controller
                  name="start_date_time"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      id="start_date_time"
                      type="datetime-local"
                      {...field}
                      className="col-span-3"
                    />
                  )}
                />
              </div>
              <div className="text-right">
                {error.start_date_time && (
                  <span className="text-red-500 text-sm">
                    {String(error.start_date_time.message)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="end_date_time" className="text-right">
                  End Date and Time
                </Label>
                <Controller
                  name="end_date_time"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      id="end_date_time"
                      type="datetime-local"
                      {...field}
                      className="col-span-3"
                    />
                  )}
                />
              </div>
              <div className="text-right">
                {error.end_date_time && (
                  <span className="text-red-500 text-sm">
                    {String(error.end_date_time.message)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Select type
                </Label>
                <Controller
                  name="event_type"
                  control={form.control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
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
                        <SelectItem value={EventType.Both}>Both</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="text-right">
                {error.event_type && (
                  <span className="text-red-500 text-sm">
                    {String(error.event_type.message)}
                  </span>
                )}
              </div>
            </div>

            {(EventTypeSelection === EventType.Physical ||
              EventTypeSelection === EventType.Both) && (
              <div className="flex flex-col">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="location" className="text-right">
                    Location
                  </Label>
                  <Controller
                    name="location"
                    control={form.control}
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
                <div className="text-right">
                  {error.location && (
                    <span className="text-red-500 text-sm">
                      {String(error.location.message)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {(EventTypeSelection === EventType.Virtual ||
              EventTypeSelection === EventType.Both) && (
              <div className="flex flex-col">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="meeting_link" className="text-right">
                    Meeting Link
                  </Label>
                  <Controller
                    name="meeting_link"
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        id="meeting_link"
                        {...field}
                        className="col-span-3"
                      />
                    )}
                  />
                </div>
                <div className="text-right">
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
                  <AlertDialogTrigger className="mr-auto">
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
                <Button loading={addUpdatedEventLoading} type="submit">
                  Save
                </Button>
              </>
            ) : (
              <Button type="submit" loading={addEventLoading}>
                Create Event
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateEvent
