import { Avatar, AvatarFallback } from "@/src/components/ui/avatar"
import { Card, CardContent } from "@/src/components/ui/card"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetEventAttendeesAction } from "@/src/server-actions/EventUsers/EventUser"
import { useEffect, useState } from "react"
import { toast } from "@/src/hooks/use-toast"
import { useEventAttendees } from "@/src/hooks/useEventAttendees"
import { useAtomValue } from "jotai"
import { eventStore } from "@/src/store/event/eventStore"

type Attendee = {
  name: string
  role?: string
  initials?: string
}

export function AttendeesList({ eventId }: { eventId: number | undefined }) {
  // const [attendeeLoading, attendeeData, attendeeError, getEventAttendees] =
  //   useServerAction(GetEventAttendeesAction)

  // const [attendees, setAttendees] = useState<Attendee[]>([])

  // useEffect(() => {
  //   if (!eventId) return

  //   const fetchEventAttendees = async () => {
  //     try {
  //       const res = await getEventAttendees(eventId)
  //       console.log("attendees", res)

  //       if (res?.data && Array.isArray(res.data)) {
  //         console.log("attendes", res)

  //         setAttendees(res.data)
  //       } else {
  //         setAttendees([])
  //       }
  //     } catch (error) {
  //       toast({
  //         title: "Login required",
  //         description: "Please log in to register for the event.",
  //         duration: 3000
  //       })
  //     }
  //   }

  //   fetchEventAttendees()
  // }, [eventId])

  const { attendees, loading, error, refetch } = useEventAttendees(eventId)
  const refreshTrigger = useAtomValue(eventStore.refreshEventsTriggerAtom)

  useEffect(() => {
    refetch()
  }, [refreshTrigger])

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3">
          Attendees ({attendees.length}) - Event ID: {eventId}
        </h3>

        {loading && (
          <div className="text-sm text-gray-500">Loading attendees...</div>
        )}
        {error && (
          <div className="text-sm text-red-500">
            {typeof error === "string" ? error : "Failed to load attendees."}
          </div>
        )}

        {!loading && !error && attendees.length === 0 && (
          <div className="text-sm text-gray-500">No attendees found.</div>
        )}

        <div className="space-y-3">
          {attendees.map((attendee, index) => (
            <div key={index} className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-gray-300 text-gray-700 text-xs">
                  {attendee.initials || attendee.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-sm">{attendee.name}</div>
                <div className="text-xs text-gray-500">
                  {(attendee as any)?.userRoles?.[0]?.name || "Attendee"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
