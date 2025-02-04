"use client";
import { useEffect, useState } from "react";
import { CardHeader, CardTitle } from "@/src/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import UpComingEvent from "./UpComingEvent";
import CelenderVeiw from "./CelenderVeiw";
import { SelectEvent } from "@/src/db/schema";
import { GetEventsAction } from "@/src/server-actions/events/event";
import { useServerAction } from "@/src/hooks/useServerAction";
import moment from "moment-timezone";



export function EventsScreen() {
  const [events, setEvents] = useState<SelectEvent[]>([]);
  const [getEventsLoading, getEventsData, getEventsError, GetEvents] = useServerAction(GetEventsAction);

  const startDate = moment.utc().toISOString();
  const endDate = moment.utc(startDate).add(3, "month").toISOString();

  useEffect(() => {
    GetEvents(startDate, endDate);
  }, []);

  useEffect(() => {
    if (getEventsData != null) {
      setEvents(getEventsData.data ? getEventsData.data : [])
    };
  }, [getEventsData])



  return (
    <div className="h-auto flex flex-col">
      <CardHeader className="pl-0">
        <CardTitle>Events</CardTitle>
      </CardHeader>
      <Tabs defaultValue="upcoming" className="flex-1 flex flex-col">
        <TabsList className="w-full">
          <TabsTrigger value="upcoming" className="flex-1">
            Upcoming Events
          </TabsTrigger>
          {/* <TabsTrigger value="calendar" className="flex-1">
            Calendar View
          </TabsTrigger> */}
        </TabsList>
        <TabsContent value="upcoming" className="flex-1 overflow-auto">
          <UpComingEvent events={events} setEvents={setEvents} />
        </TabsContent>
        {/* <TabsContent value="calendar" className="flex-1">
          <CelenderVeiw events={events} />
        </TabsContent> */}
      </Tabs>
    </div>
  );
}
