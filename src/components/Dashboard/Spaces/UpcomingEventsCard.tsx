import { Badge } from "../../ui/badge"
import { Calendar } from "../../ui/calendar"
import { Card, CardHeader, CardTitle, CardContent } from "../../ui/card"
import { Event } from "./types/spaces-types.d"

type UpcomingEventsProps = {
  events: Event[]
}

const UpcomingEventsCard: React.FC<UpcomingEventsProps> = (props) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {props.events.map((event: Event, index) => (
            <li key={index} className="flex justify-between items-center">
              <span>{event.name}</span>
              <Badge variant="outline">
                {/* <Calendar className="mr-1 h-3 w-3" /> */}
                {event.date}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export default UpcomingEventsCard
