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

interface EventcardProps {
  id: string;
  title: string;
  description: string;
  date: Date;
  location: string;
  attendees: number;
}

const EventCard = ({
  title,
  description,
  date,
  location,
  attendees,
}: EventcardProps) => {
  return (
    <Card className="w-full sm:w-[49%] mt-5">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          <span>{date.toLocaleDateString()}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-2">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-2">
          <Users className="h-4 w-4" />
          <span>{attendees} attendees</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button>Register</Button>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
