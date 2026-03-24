// hooks/useEventAttendees.ts
import { useState, useEffect } from "react"
import { toast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetEventAttendeesAction } from "@/src/server-actions/EventUsers/EventUser"
import { SelectUser } from "../db/schema"

export function useEventAttendees(eventId?: number) {
  const [attendees, setAttendees] = useState<SelectUser[]>([])

  const [loading, data, error, getEventAttendees] = useServerAction(
    GetEventAttendeesAction
  )

  const fetchEventAttendees = async () => {
    if (!eventId) return
    try {
      const res = await getEventAttendees(eventId)
      if (res?.success && res?.data) {
        setAttendees(res?.data?.map((a) => a.user))
      } else {
        setAttendees([])
      }
    } catch (error: any) {
      toast({
        title: "Failed to load attendees",
        description:
          error.message || "There was a problem fetching event attendees.",
        duration: 3000
      })
    }
  }

  useEffect(() => {
    fetchEventAttendees()
  }, [eventId])

  return { attendees, loading, error, refetch: fetchEventAttendees }
}
