import React, { Dispatch, SetStateAction } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { CalendarDays, MapPin, Presentation, Projector, Users } from "lucide-react";
import { Button } from "../../ui/button";
import { SelectEvent } from "@/src/db/schema";
import { useAtomValue } from "jotai";
import { userStore } from "@/src/store/user/userStore";
import moment from "moment";


interface EventcardProps {
  event: SelectEvent;
  setFormModelVisibility: Dispatch<SetStateAction<boolean>>
  setSelectedEvent: Dispatch<SetStateAction<SelectEvent | null>>
}



const EventCard = ({ event, setFormModelVisibility, setSelectedEvent }: EventcardProps) => {
  const authUser = useAtomValue(userStore.AuthUser);
  const localStartDate = moment.utc(event.start_date_time ? event.start_date_time : "").local().format("DD/MM/YYYY hh:mm A");
  const localEndDate = moment.utc(event.end_date_time ? event.end_date_time : "").local().format("DD/MM/YYYY hh:mm A");

  function openDialog(event: SelectEvent) {
    setSelectedEvent(event)
    setFormModelVisibility(true)

  }

  return (
    <Card className="w-full lg:w-[49%] mt-2">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle className="font-sans text-xl mb-2">{event.title}</CardTitle>
          <CardDescription >{event.description}</CardDescription>
        </div>
        {event.host_id === authUser?.unique_id && (
          <Button variant='edit' size={"sm"} onClick={() => { openDialog(event) }}>Edit</Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4 text-primary" />
          <span><strong>Start Date Time: </strong>{localStartDate}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          <span><strong>End Date Time: </strong>{localEndDate}</span>
        </div>

        {event.type === "physical" ? (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span><strong>Location: </strong>
              {(() => {
                try {
                  const metadata = JSON.parse(event.metadata || "{}");
                  return metadata.location || "";
                } catch {
                  return "";
                }
              })()}
            </span>
          </div>
        ) : event.type === "virtual" ? (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-2">
            <Presentation className="h-4 w-4 text-primary" />
            <span>
              <strong>Meeting Link: </strong>
              {(() => {
                const metadata = JSON.parse(event.metadata || "{}");
                return metadata.meeting_link ? (
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={metadata.meeting_link}
                    className="hover:text-blue-600 hover:underline">
                    {metadata.meeting_link}
                  </a>
                ) : (
                  ""
                );

              })()}
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span><strong>Location: </strong>
                {(() => {
                  try {
                    const metadata = JSON.parse(event.metadata || "{}");
                    return metadata.location || "";
                  } catch {
                    return "";
                  }
                })()}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-2">
              <Presentation className="h-4 w-4 text-primary" />
              <span>
                <strong>Meeting Link: </strong>
                {(() => {
                  const metadata = JSON.parse(event.metadata || "{}");
                  return metadata.meeting_link ? (
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href={metadata.meeting_link}
                      className="hover:text-blue-600 hover:underline">
                      {metadata.meeting_link}
                    </a>
                  ) : (
                    ""
                  );

                })()}
              </span>
            </div>
          </>
        )}


        <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-2">
          <Users className="h-4 w-4 text-primary" />
          <span><strong> Attendees: </strong>{0}</span>
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button>Register</Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
