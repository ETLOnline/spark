"use client"
import { useEffect, useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent } from "@/src/components/ui/card"
import { toast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"
import { userStore } from "@/src/store/user/userStore"
import { useAtomValue, useSetAtom } from "jotai"
import { Share, Heart } from "lucide-react"
import {
  CreateEventUsersAction,
  GetEventUserByIdAction
} from "@/src/server-actions/EventUsers/EventUser"
import { GetEventByIdAction } from "@/src/server-actions/events/event"
import { SelectEvent } from "@/src/db/schema"
import { eventStore } from "@/src/store/event/eventStore"
import { InviteEventModal } from "@/src/components/ui/inviteEventModal"
import { usePathname } from "next/navigation"

interface Props {
  event_id: string
  eventEndTime: string | null | undefined
}

export function EventPricing({ event_id, eventEndTime }: Props) {
  const [isRegistered, setIsRegistered] = useState<boolean>(false)
  const [isEventEnded, setIsEventEnded] = useState<boolean>(false)
  const [eventEntity, setEventEntity] = useState<SelectEvent>()
  const [openModal, setOpenModal] = useState<boolean>(false)
  const [inviteLink, setInviteLink] = useState<string>("")
  const Iam = useAtomValue(userStore.Iam)

  const setRefreshEventsTrigger = useSetAtom(
    eventStore.refreshEventsTriggerAtom
  )

  const [eventUserLoading, eventUsersData, evenUseError, createEventUsers] =
    useServerAction(CreateEventUsersAction)

  const [checkLoading, checkData, , checkEventUser] = useServerAction(
    GetEventUserByIdAction
  )

  const [eventLoading, eventData, , getEventById] =
    useServerAction(GetEventByIdAction)

  useEffect(() => {
    const fetchRegistrationStatus = async () => {
      if (!Iam?.unique_id || !event_id) return

      try {
        const response = await checkEventUser({
          event_id: Number(event_id),
          user_id: Iam.unique_id
        })
        if (response?.success && response.data.length > 0) {
          setIsRegistered(true)
        } else {
          setIsRegistered(false)
        }
      } catch (error) {
        setIsRegistered(false)
      }
    }

    fetchRegistrationStatus()
  }, [Iam, event_id])

  useEffect(() => {
    if (!eventEndTime) {
      setIsEventEnded(false)
      return
    }

    const eventDate = new Date(eventEndTime)
    const now = new Date()

    if (!isNaN(eventDate.getTime())) {
      setIsEventEnded(eventDate < now)
    } else {
      setIsEventEnded(false)
    }
  }, [eventEndTime])

  const handleRegisterEvent = async () => {
    if (!Iam?.unique_id) {
      toast({
        title: "Login required",
        description: "Please log in to register for the event.",
        duration: 3000
      })
      return
    }

    const data = {
      event_id: Number(event_id),
      user_id: Iam.unique_id
    }

    const res = await createEventUsers(data)

    if (res?.success) {
      setIsRegistered(true)
      toast({
        title: "Registered successfully",
        description: "You are now registered for the event.",
        duration: 3000
      })
      setRefreshEventsTrigger((prev) => !prev)
    }
  }

  const path = usePathname()

  useEffect(() => {
    if (typeof window !== "undefined") {
      setInviteLink(
        `${window.location.protocol}//${window.location.host}${path}`
      )
    }
  }, [path])

  return (
    <Card className="mb-6">
      <CardContent className="p-4 text-center">
        <Button
          onClick={handleRegisterEvent}
          variant="default"
          className="w-full mb-3"
          disabled={eventUserLoading || isRegistered || isEventEnded}
        >
          {eventUserLoading
            ? "Loading..."
            : isEventEnded
              ? "Event Ended"
              : isRegistered
                ? "Registered"
                : "Register"}
        </Button>

        <div className="flex gap-2">
          <Button
            onClick={() => setOpenModal(true)}
            variant="outline"
            size="sm"
            className="flex-1 bg-transparent"
          >
            <Share className="w-4 h-4 mr-1" />
            Share
          </Button>
        </div>
      </CardContent>

      <InviteEventModal
        open={openModal}
        onOpenChange={setOpenModal}
        inviteLink={inviteLink}
      />
    </Card>
  )
}
