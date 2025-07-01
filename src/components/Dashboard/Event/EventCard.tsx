import React, { Dispatch, SetStateAction } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "../../ui/card"
import {
  CalendarDays,
  MapPin,
  Presentation,
  Projector,
  Users
} from "lucide-react"
import { Button } from "../../ui/button"
import { SelectEvent } from "@/src/db/schema"
import { useAtomValue, useSetAtom } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import moment from "moment"
import { eventStore } from "@/src/store/event/eventStore"
import { EventType } from "../../common/types/event.types"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"

interface EventcardProps {
  event: SelectEvent
}

const EventCard = ({ event }: EventcardProps) => {
  const { permissionChecker } = usePermissionChecker("global")
  const canUpdate = permissionChecker
    ? permissionChecker?.canAccess("event.update")
    : false

  const setSelectedEvent = useSetAtom(eventStore.selectedEvent)
  const setFormModalVisibility = useSetAtom(eventStore.formModalVisibility)
  const authUser = useAtomValue(userStore.AuthUser)

  const localStartDate = moment
    .utc(event.start_date_time ? event.start_date_time : "")
    .local()
    .format("DD/MM/YYYY hh:mm A")
  const localEndDate = moment
    .utc(event.end_date_time ? event.end_date_time : "")
    .local()
    .format("DD/MM/YYYY hh:mm A")

  function openDialog(event: SelectEvent) {
    setSelectedEvent(event)
    setFormModalVisibility(true)
  }

  const location = (() => {
    const metadata = JSON.parse(event.metadata || "{}")
    return metadata.location
  })()

  const meeting_link = (() => {
    const metadata = JSON.parse(event.metadata || "{}")
    return (
      metadata.meeting_link && (
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={metadata.meeting_link}
          className="hover:text-blue-600 hover:underline"
        >
          {metadata.meeting_link}
        </a>
      )
    )
  })()

  return (
    <Card className="w-full lg:w-[49%] mt-2">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="font-sans text-xl mb-2">
            {event.title}
          </CardTitle>
          <CardDescription>{event.description}</CardDescription>
        </div>
        {event.host_id === authUser?.unique_id && canUpdate && (
          <Button
            variant="edit"
            size={"sm"}
            onClick={() => {
              openDialog(event)
            }}
          >
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4 text-primary" />
          <span>
            <strong>Start Date Time: </strong>
            {localStartDate}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          <span>
            <strong>End Date Time: </strong>
            {localEndDate}
          </span>
        </div>

        {(event.type === EventType.Both ||
          event.type === EventType.Physical) && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span>
              <strong>Location: </strong>
              {location}
            </span>
          </div>
        )}

        {(event.type === EventType.Both ||
          event.type === EventType.Virtual) && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-2">
            <Presentation className="h-4 w-4 text-primary" />
            <span>
              <strong>Meeting Link: </strong>
              {meeting_link}
            </span>
          </div>
        )}

        <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-2">
          <Users className="h-4 w-4 text-primary" />
          <span>
            <strong> Attendees: </strong>
            {0}
          </span>
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button>Register</Button>
      </CardFooter>
    </Card>
  )
}

export default EventCard
