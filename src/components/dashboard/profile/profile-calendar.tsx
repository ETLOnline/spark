import { useState } from "react"
import {
  Card,
  CardTitle,
  CardDescription,
  CardContent,
  CardHeader,
} from "../../ui/card"
import { Calendar } from "@/src/components/ui/calendar"

const ProfileCalendar: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date())

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendar</CardTitle>
        <CardDescription>Your schedule and upcoming events</CardDescription>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />
      </CardContent>
    </Card>
  )
}

export default ProfileCalendar
