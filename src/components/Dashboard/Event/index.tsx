"use client"

import { useEffect, useState } from "react"
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/src/components/ui/tabs"
import UpComingEvent from "./UpComingEvent"
import { SelectEvent, SelectUser } from "@/src/db/schema"
import { GetEventsAction } from "@/src/server-actions/events/event"
import { useServerAction } from "@/src/hooks/useServerAction"
import moment from "moment-timezone"
import { Button } from "../../ui/button"
import { Plus } from "lucide-react"
import EventsFilterBar from "./EventsFilterBar"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { eventStore } from "@/src/store/event/eventStore"
import { hostStore } from "@/src/store/host/hostStore"
import { userStore } from "@/src/store/user/userStore"

export function EventsScreen() {
  const [events, setEvents] = useState<SelectEvent[]>([])
  const [filteredEvents, setFilteredEvents] = useState<SelectEvent[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [eventType, setEventType] = useState<
    "virtual" | "physical" | "hybrid" | "all"
  >("all")
  const [eventCategory, setEventCategory] = useState("all")
  const [availableTags, setAvailableTags] = useState<
    { id: string; name: string }[]
  >([])
  const setHostsGlobal = useSetAtom(hostStore.hosts)
  const setFormModalVisibility = useSetAtom(eventStore.formModalVisibility)

  const [getEventsLoading, getEventsData, getEventsError, GetEvents] =
    useServerAction(GetEventsAction)

  const startDate = moment.utc().toISOString()
  const endDate = moment.utc(startDate).add(3, "month").toISOString()
  const [refreshTrigger, setRefreshTrigger] = useAtom(
    eventStore.refreshEventsTriggerAtom
  )

  const SuperAdmin = useAtomValue(userStore.SuperAdmin)

  useEffect(() => {
    GetEvents(startDate, endDate)
  }, [refreshTrigger])

  useEffect(() => {
    if (getEventsData != null) {
      const allEvents = getEventsData.data || []
      const processedEvents: SelectEvent[] = []
      const hostMap: Record<string, SelectUser> = {}

      allEvents.forEach((item: any) => {
        processedEvents.push(item)
        if (item.host?.unique_id) {
          hostMap[item.host.unique_id] = item.host
        }
      })

      setEvents(processedEvents)
      setHostsGlobal(hostMap)

      const TagSet = new Set<string>()
      processedEvents.forEach((event) => {
        event.tags?.forEach((tag) => {
          TagSet.add(tag)
        })
      })

      const tags = Array.from(TagSet).map((tag) => ({
        id: tag,
        name: tag.charAt(0).toUpperCase() + tag.slice(1)
      }))

      setAvailableTags(tags)
    }
  }, [getEventsData, setHostsGlobal])

  // Search and filter events
  useEffect(() => {
    let filtered = [...events]

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase()
      filtered = filtered.filter((event) =>
        event.title.toLowerCase().includes(lowerSearch)
      )
    }

    if (eventType !== "all") {
      filtered = filtered.filter((event) => event.type === eventType)
    }

    if (eventCategory !== "all") {
      filtered = filtered.filter(
        (event) => event?.tags && event.tags.includes(eventCategory)
      )
    }

    setFilteredEvents(filtered)
  }, [searchTerm, eventType, eventCategory, events])

  return (
    <div className="h-auto flex flex-col gap-1">
      <CardHeader className="flex flex-row p-0 justify-between w-full">
        <CardContent className=" pl-1">
          <CardTitle className="text-lg">Spark Community Events</CardTitle>
          <CardDescription>
            Discover and join amazing events in our community.
          </CardDescription>
        </CardContent>
        {SuperAdmin && (
          <Button className="" onClick={() => setFormModalVisibility(true)}>
            <Plus className=" h-4 w-4" />
            Create Event
          </Button>
        )}
      </CardHeader>

      <Tabs defaultValue="upcoming" className="flex-1 flex flex-col">
        <TabsList className="bg-transparent">
          <EventsFilterBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            eventType={eventType}
            onEventTypeChange={setEventType}
            eventCategory={eventCategory}
            onCategoryChange={setEventCategory}
            availableTags={availableTags}
          />
        </TabsList>

        <TabsContent value="upcoming" className="flex-1 overflow-auto">
          <UpComingEvent
            getEventsLoading={getEventsLoading}
            setRefreshTrigger={setRefreshTrigger}
            events={filteredEvents}
            setEvents={setEvents}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
