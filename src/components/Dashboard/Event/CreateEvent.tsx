import React, { use, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Button } from "../../ui/button";
import { InsertEvent, SelectEvent } from "@/src/db/schema";
import { useServerAction } from "@/src/hooks/useServerAction";
import { CreateEventAction, DeleteEventAction, UpdateEventsAction } from "@/src/server-actions/events/event";
import { datetime } from "drizzle-orm/mysql-core";
import { useAtomValue } from "jotai";
import { userStore } from "@/src/store/user/userStore";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../ui/alert-dialog";
import { AlertDialogTrigger } from "@radix-ui/react-alert-dialog";
import { useToast } from "@/src/hooks/use-toast";
import { z } from "zod";
import moment from "moment";


interface Props {
  events: SelectEvent[];
  setEvents: React.Dispatch<React.SetStateAction<SelectEvent[]>>;
  formModalVisibility: boolean;
  setFormModalVisibility: React.Dispatch<React.SetStateAction<boolean>>;
  selectEvent: SelectEvent | null;
  setSelectEvent: React.Dispatch<React.SetStateAction<SelectEvent | null>>;
}

const now = moment().format("YYYY-MM-DD HH:mm");

const eventSchema = z.object({
  title: z.string().min(1, "Title is required").max(30, "Title is too long"),
  description: z.string().min(1, "Description is required").max(50, "Description is too long"),
  start_date_time: z.string().min(1, "Start date and time is required"),
  end_date_time: z.string().min(1, "End date and time is required"),
  location: z.string().min(1, "Location is required")
}).superRefine((data, ctx) => {
  if (new Date(data.start_date_time) <= new Date(now)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["start_date_time"],
      message: "Start date and time must be current date and time or later",
    });
  }

  if (new Date(data.end_date_time) <= new Date(data.start_date_time)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["end_date_time"],
      message: "End date and time must be after the start date and time",
    });
  }
})
  ;



export const CreateEvent = ({ events, setEvents, formModalVisibility, setFormModalVisibility, setSelectEvent, selectEvent }: Props) => {

  const [newEvent, setNewEvent] = useState<Partial<InsertEvent>>({
    title: "",
    description: "",
    start_date_time: datetime().toString(),
    end_date_time: "",
    location: "",
    host_id: "",
  });
  const [editEvent, setEditEvent] = useState(false)
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});



  useEffect(() => {
    if (selectEvent) {
      const selesctedEventCopy = { ...selectEvent }
      selesctedEventCopy.start_date_time = moment.utc(selesctedEventCopy.start_date_time).local().format("YYYY-MM-DD HH:mm")
      selesctedEventCopy.end_date_time = moment.utc(selesctedEventCopy.end_date_time).local().format("YYYY-MM-DD HH:mm")
      setNewEvent(selesctedEventCopy)
    } else {
      setNewEvent({
        title: "",
        description: "",
        start_date_time: datetime().toString(),
        end_date_time: "",
        location: "",
        host_id: "",
      })
    }
  }, [selectEvent])

  useEffect(() => {
    if (!formModalVisibility) {
      setSelectEvent(null)
    }
  }, [formModalVisibility])

  useEffect(() => {
    if (selectEvent != null) {
      setEditEvent(true)
    } else {
      setEditEvent(false)
    }
  }, [selectEvent])

  useEffect(() => {
    setFormErrors({})
  }, [formModalVisibility])



  const [addEventLoading, addEventError, addEventData, CreateEvent] = useServerAction(CreateEventAction);
  const [addUpdatedEventLoading, addUpdatedEventData, addUpdatedEventError, UpdateEvents] = useServerAction(UpdateEventsAction);
  const [addDeleteEventLoading, addDeleteEventData, addDeleteEventError, DeleteEvent] = useServerAction(DeleteEventAction)
  const authUser = useAtomValue(userStore.AuthUser);
  const { toast } = useToast()


  async function handleCreateEvent() {
    try {
      setFormErrors({})
      eventSchema.parse(newEvent);
      const payLoad = { ...newEvent }
      payLoad.start_date_time = moment(newEvent.start_date_time).toISOString();
      payLoad.end_date_time = moment(newEvent.end_date_time).toISOString();
      payLoad.host_id = authUser?.unique_id;

      const createdEvent = await CreateEvent(payLoad as InsertEvent);
      if (createdEvent?.success && createdEvent.data) {
        setEvents([...events, createdEvent.data]);
        setFormModalVisibility(false)
        toast({
          title: "Event created",
          description: "Your evnet has been created successfully.",
          duration: 3000
        })
      }
      setNewEvent({
        title: "",
        description: "",
        start_date_time: "",
        end_date_time: "",
        location: "",
        host_id: "",
      });

    } catch (error) {
      if (error instanceof z.ZodError) {
        setFormErrors(Object.fromEntries(error.errors.map((error) => [error.path[0], error.message])));
      }
    }
  }

  async function handleUpdateEvent() {
    if (
      newEvent?.title &&
      newEvent?.description &&
      newEvent?.start_date_time &&
      newEvent?.end_date_time &&
      newEvent?.location
    ) {
      const updateEvent = { ...newEvent }
      updateEvent.start_date_time = moment(newEvent.start_date_time).utc().toString();
      updateEvent.end_date_time = moment(newEvent.end_date_time).utc().toString();

      const updatedEvent = await UpdateEvents(updateEvent as SelectEvent)
      if (updatedEvent?.success && updatedEvent.data) {
        setEvents((Events) =>
          Events.map((event) =>
            event.id === updateEvent.id ? updatedEvent.data : event
          )
        );
        setFormModalVisibility(false)
        toast({
          title: "Event updated",
          description: "Your changes have been saved successfully.",
          duration: 3000
        })
      }
    }
  };

  async function handleDeleteEvent() {
    const deletedEvent = await DeleteEvent(newEvent as SelectEvent)
    if (deletedEvent?.success) {
      setEvents((Events) =>
        Events.filter((event) =>
          event.id !== newEvent.id
        )
      )
      setFormModalVisibility(false)
      toast({
        title: "Event deleted."
      })
    }
  }



  return (
    <Dialog open={formModalVisibility} onOpenChange={(open) => { setFormModalVisibility(open) }} >
      <DialogTrigger asChild>
        <button className="p-[3px] relative w-max">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
          <div className="px-8 py-2  bg-primary rounded-[6px]  relative group transition duration-200 text-primary-foreground hover:bg-transparent">
            Add Event
          </div>
        </button>
      </DialogTrigger>
      <DialogContent accessKey="hello">
        <DialogHeader>
          <DialogTitle>{editEvent === true ? 'Edit event' : 'Create a new event'}</DialogTitle>
          <DialogDescription>
            {editEvent === true ? 'Fill in the details to edit your event' : 'Fill in the details for your new event.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={newEvent?.title ? newEvent.title : ""}
                onChange={(e) => {
                  setFormErrors((prev) => ({ ...prev, title: "" }));
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
                }
                className="col-span-3"
              />
            </div>
            <div className="text-right">
              {formErrors.title && <span className="text-red-500 text-sm">{formErrors.title}</span>}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={newEvent.description ? newEvent.description : ""}
                onChange={(e) => {
                  setFormErrors((prev) => ({ ...prev, description: "" }));
                  setNewEvent({ ...newEvent, description: e.target.value })
                }
                }
                className="col-span-3"
              />
            </div>
            <div className="text-right">
              {formErrors.description && <span className="text-red-500 text-sm">{formErrors.description}</span>}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start date time" className="text-right">
                start Date and Time
              </Label>
              <Input
                id="start date time"
                type="datetime-local"
                value={newEvent.start_date_time ? newEvent.start_date_time : ""}
                onChange={(e) => {
                  setFormErrors((prev) => ({ ...prev, start_date_time: "" }));
                  setNewEvent({ ...newEvent, start_date_time: e.target.value })
                }
                }
                className="col-span-3"
              />
            </div>
            <div className="text-right">
              {formErrors.start_date_time && <span className="text-red-500 text-sm">{formErrors.start_date_time}</span>}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end date time" className="text-right">
                End Date and Time
              </Label>
              <Input
                id="end date time"
                type="datetime-local"
                value={newEvent.end_date_time ? newEvent.end_date_time : ""}
                onChange={(e) => {
                  setFormErrors((prev) => ({ ...prev, end_date_time: "" }));
                  setNewEvent({ ...newEvent, end_date_time: e.target.value })
                }
                }
                className="col-span-3"
              />
            </div>
            <div className="text-right">
              {formErrors.end_date_time && <span className="text-red-500 text-sm">{formErrors.end_date_time}</span>}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                value={newEvent.location}
                onChange={(e) => {
                  setFormErrors((prev) => ({ ...prev, location: "" }));
                  setNewEvent({ ...newEvent, location: e.target.value })
                }
                }
                className="col-span-3"
              />
            </div>
            <div className="text-right">
              {formErrors.location && <span className="text-red-500 text-sm">{formErrors.location}</span>}
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          {editEvent === true ?
            <>
              <AlertDialog>
                <AlertDialogTrigger className="mr-auto"><Button loading={addDeleteEventLoading} variant="destructive">Delete</Button></AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Event?</AlertDialogTitle>
                    <AlertDialogDescription>Are you sure you want to delete your event?</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteEvent}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <Button loading={addUpdatedEventLoading} onClick={handleUpdateEvent}>Save</Button>
            </>
            : <Button loading={addEventLoading} onClick={handleCreateEvent}>Create Event</Button>}

        </DialogFooter>
      </DialogContent>
    </Dialog >
  );
};

export default CreateEvent;
