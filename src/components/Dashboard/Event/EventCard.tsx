import {
  CalendarDays,
  MapPin,
  Presentation,
  Users,
  Clock,
  Video,
  MoreHorizontal,
  ArrowRight
} from "lucide-react"
import { Button } from "../../ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar"
import { Badge } from "../../ui/badge"
import { Dispatch, SetStateAction } from "react"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "../../ui/card"
import Link from "next/link"
import { useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { SelectEvent } from "@/src/db/schema"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "../../ui/dropdown-menu"
import Image from "next/image"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { eventStore } from "@/src/store/event/eventStore"
import { DeleteEventAction } from "@/src/server-actions/events/event"
import { useServerAction } from "@/src/hooks/useServerAction"
import { toast } from "@/src/hooks/use-toast"
import { useEventAttendees } from "@/src/hooks/useEventAttendees"
import moment from "moment"
import { userStore } from "@/src/store/user/userStore"
import { useTheme } from "next-themes"
import clsx from "clsx"
import { hostStore } from "@/src/store/host/hostStore"

interface EventCardProps {
  event: SelectEvent
  setRefreshTrigger: Dispatch<SetStateAction<boolean>>
}

const EventCard = ({ event, setRefreshTrigger }: EventCardProps) => {
  const router = useRouter()
  const setSelectedEvent = useSetAtom(eventStore.selectedEvent)
  const setFormModalVisibility = useSetAtom(eventStore.formModalVisibility)
  const { attendees, loading, error } = useEventAttendees(event?.id)

  const metadata = JSON.parse(event?.metadata || "{}")
  const location = metadata.location
  const meeting_link = metadata.meeting_link
  const SuperAdmin = useAtomValue(userStore.SuperAdmin)
  const { theme, setTheme } = useTheme()
  const hosts = useAtomValue(hostStore.hosts)
  const formattedStart = moment(event?.start_date_time).calendar(null, {
    sameDay: "[Today at] hh:mm A",
    nextDay: "[Tomorrow at] hh:mm A",
    nextWeek: "dddd [at] hh:mm A",
    lastDay: "[Yesterday at] hh:mm A",
    lastWeek: "[Last] dddd [at] hh:mm A",
    sameElse: "ddd, DD MMM YYYY [at] hh:mm A"
  })

  const [deleteEventLoaind, deleteEventData, deleteEventsError, DeleteEvent] =
    useServerAction(DeleteEventAction)

  const getEventTypeBadge = () => {
    switch (event?.type) {
      case "physical":
        return {
          label: "In-Person",
          variant: "muted",
          icon: <MapPin className="h-4 w-4" />
        }
      case "virtual":
        return {
          label: "Virtual",
          variant: "muted",
          icon: <Video className="h-4 w-4" />
        }
      case "hybrid":
        return {
          label: "Hybrid",
          variant: "muted",
          icon: <Presentation className="h-4 w-4" />
        }
      default:
        return {
          label: "Event",
          variant: "dark",
          icon: <CalendarDays className="h-4 w-4" />
        }
    }
  }

  const eventTypeBadge = getEventTypeBadge()

  function openDialog(event: SelectEvent) {
    setSelectedEvent(event)
    setFormModalVisibility(true)
  }

  const hostData = hosts[event?.host_id]
  const handleDeleteEvent = async (event: SelectEvent) => {
    try {
      const res = await DeleteEvent(event)
      if (res?.success) {
        toast({
          title: "Delete Event ",
          description: "Delete Event Successfully",
          duration: 3000
        })
        setRefreshTrigger((prev) => !prev)
      }
    } catch (error) {
      console.log("error in event delete", error)
      toast({
        title: "Delete Event Failed",
        description: "Something went wrong while deleting the event.",
        duration: 4000,
        variant: "destructive"
      })
    }
  }

  return (
    <Card className="w-full max-w-[305px]  overflow-hidden">
      <div className="relative h-48 bg-gray-200 flex items-center justify-center">
        <Image
          src={event?.coverImage || "/images/profile/background.svg"}
          alt={event?.title}
          layout="fill"
          objectFit="cover"
        />
        {/* menu action  */}
        <div className=" absolute top-1  right-3">
          {SuperAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={"outline"}
                  size="icon"
                  className="h-8 w-8 bg-background "
                >
                  <MoreHorizontal className="h-4 w-4 " />
                  <span className="sr-only">Event Card Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => openDialog(event)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleDeleteEvent(event)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <Badge
          variant={
            eventTypeBadge.variant as
              | "muted"
              | "ghost"
              | "default"
              | "secondary"
              | "destructive"
              | "outline"
          }
          className="absolute top-3 left-3 gap-1  rounded-md flex items-center"
        >
          {eventTypeBadge.icon}
          {eventTypeBadge.label}
        </Badge>
      </div>

      <CardHeader className="p-3">
        <CardTitle className="text-lg font-semibold leading-tight  pt-1 whitespace-nowrap text-ellipsis overflow-hidden">
          {event.title}
        </CardTitle>
        <CardDescription className="text-sm line-clamp-2 text-white  whitespace-nowrap overflow-hidden text-ellipsis">
          {event?.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 p-3  min-h-[173px] ">
        <div className="flex items-center gap-2 text-sm">
          <CalendarDays className="w-4 h-4" />
          <span className="whitespace-nowrap overflow-hidden text-ellipsis">
            {formattedStart}
          </span>
        </div>

        {(event.type === "physical" || event.type === "hybrid") && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{location || "Location TBD"}</span>
          </div>
        )}

        {(event.type === "virtual" || event.type === "hybrid") && (
          <div className="flex items-center gap-2 text-sm">
            <Video className="w-4 h-4" />
            {meeting_link ? (
              <a
                href={
                  meeting_link.startsWith("http")
                    ? meeting_link
                    : `https://${meeting_link}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="max-w-full overflow-hidden whitespace-nowrap text-ellipsis hover:text-blue-400 hover:underline"
              >
                {meeting_link}
              </a>
            ) : (
              <span className="max-w-full overflow-hidden whitespace-nowrap text-ellipsis">
                Virtual Event
              </span>
            )}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 ">
              <Users className="w-4 h-4" />
              <span>{attendees.length}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-1  w-full overflow-hidden  whitespace-nowrap">
          {event?.tags?.slice(0, 1).map((tag, index) => (
            <Badge
              key={index}
              variant="outline"
              className="text-xs px-2 py-0.5"
            >
              {tag}
            </Badge>
          ))}
          {(event?.tags?.length ?? 0) > 1 && (
            <Badge variant={"outline"} className="">
              +{(event?.tags?.length ?? 0) - 1}
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-start gap-2 p-3  ">
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6">
            <AvatarImage src={hostData?.profile_url || "/placeholder.svg"} />
            <AvatarFallback className="text-xs">H</AvatarFallback>
          </Avatar>
          <span className="text-sm ">
            By{" "}
            {`${hostData?.first_name || ""} ${hostData?.last_name || ""}` ||
              "host"}{" "}
          </span>
        </div>
        <Link href={`/events/${event?.id}`} className="w-full">
          <Button variant="outline" size="sm" className="w-full">
            View Details <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

export default EventCard
