import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { CalendarDays, MapPin, Users } from "lucide-react";
import { Button } from "../../ui/button";
import { SelectEvent } from "@/src/db/schema";
import { useAtomValue } from "jotai";
import { userStore } from "@/src/store/user/userStore";
import moment from "moment";
import { datetime } from "drizzle-orm/mysql-core";

interface EventcardProps {
  event: SelectEvent;
  setFormModelVisibility: React.Dispatch<React.SetStateAction<boolean>>
  setSelectEvent: React.Dispatch<React.SetStateAction<SelectEvent | null>>
}



const EventCard = ({ event, setFormModelVisibility, setSelectEvent }: EventcardProps) => {
  const authUser = useAtomValue(userStore.AuthUser);
  const localStartDate = moment.utc(event.start_date_time ? event.start_date_time : "").local().format("DD/MM/YYYY hh:mm A");
  const localEndDate = moment.utc(event.end_date_time ? event.end_date_time : "").local().format("DD/MM/YYYY hh:mm A");

  function openDialog(event: SelectEvent) {
    setSelectEvent(event)
    setFormModelVisibility(true)

  }

  return (
    <Card className="w-full sm:w-[49%] mt-5">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>{event.title}</CardTitle>
          <CardDescription >{event.description}</CardDescription>
        </div>
        {event.host_id === authUser?.unique_id && (
          <Button variant='edit' size={"sm"} onClick={() => { openDialog(event) }}>Edit</Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          <span>Start Date Time:</span>
          <span>{localStartDate}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-2">
          <CalendarDays className="h-4 w-4" />
          <span>End Date Time:</span>
          <span>{localEndDate}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-2">
          <MapPin className="h-4 w-4" />
          <span>{event.location}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-2">
          <Users className="h-4 w-4" />
          <span>{0} attendees</span>
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button>Register</Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
