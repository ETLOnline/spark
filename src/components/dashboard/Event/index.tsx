'use client'
import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Calendar } from "@/src/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { Textarea } from "@/src/components/ui/textarea"
import { CalendarDays, MapPin, Users } from 'lucide-react'

interface Event {
  id: string
  title: string
  description: string
  date: Date
  location: string
  attendees: number
}

const sampleEvents: Event[] = [
  {
    id: "1",
    title: "Web Development Workshop",
    description: "Learn the latest web development techniques and tools.",
    date: new Date("2023-05-15T14:00:00Z"),
    location: "Tech Hub, Downtown",
    attendees: 50,
  },
  {
    id: "2",
    title: "AI in Healthcare Conference",
    description: "Explore the applications of AI in modern healthcare.",
    date: new Date("2023-05-20T09:00:00Z"),
    location: "Medical Center Auditorium",
    attendees: 200,
  },
  {
    id: "3",
    title: "Open Source Contributor Day",
    description: "Contribute to open source projects and learn from experts.",
    date: new Date("2023-05-25T10:00:00Z"),
    location: "Community Center",
    attendees: 75,
  },
]

export function EventsScreen() {
  const [events, setEvents] = useState<Event[]>(sampleEvents)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: "",
    description: "",
    date: new Date(),
    location: "",
  })

  const handleCreateEvent = () => {
    if (newEvent.title && newEvent.description && newEvent.date && newEvent.location) {
      const createdEvent: Event = {
        ...newEvent as Event,
        id: (events.length + 1).toString(),
        attendees: 0,
      }
      setEvents([...events, createdEvent])
      setNewEvent({ title: "", description: "", date: new Date(), location: "" })
    }
  }

  return (
    <div className="h-auto flex flex-col">
      <CardHeader>
        <CardTitle>Events</CardTitle>
        
      </CardHeader>
      <Tabs defaultValue="upcoming" className="flex-1 flex flex-col">
        <TabsList className="w-full">
          <TabsTrigger value="upcoming" className="flex-1">Upcoming Events</TabsTrigger>
          <TabsTrigger value="calendar" className="flex-1">Calendar View</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="flex-1 overflow-auto">
          <div className="grid gap-4 p-4">
            <Dialog>
                <DialogTrigger asChild>
                    <Button>Create Event</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                    <DialogTitle>Create a New Event</DialogTitle>
                    <DialogDescription>
                        Fill in the details for your new event.
                    </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                        Title
                        </Label>
                        <Input
                        id="title"
                        value={newEvent.title}
                        onChange={(e) =>
                            setNewEvent({ ...newEvent, title: e.target.value })
                        }
                        className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                        Description
                        </Label>
                        <Textarea
                        id="description"
                        value={newEvent.description}
                        onChange={(e) =>
                            setNewEvent({ ...newEvent, description: e.target.value })
                        }
                        className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">
                        Date
                        </Label>
                        <Input
                        id="date"
                        type="date"
                        value={newEvent.date?.toISOString().split('T')[0]}
                        onChange={(e) =>
                            setNewEvent({ ...newEvent, date: new Date(e.target.value) })
                        }
                        className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="location" className="text-right">
                        Location
                        </Label>
                        <Input
                        id="location"
                        value={newEvent.location}
                        onChange={(e) =>
                            setNewEvent({ ...newEvent, location: e.target.value })
                        }
                        className="col-span-3"
                        />
                    </div>
                    </div>
                    <DialogFooter>
                    <Button onClick={handleCreateEvent}>Create Event</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {events.map((event) => (
              <Card key={event.id}>
                <CardHeader>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription>{event.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4" />
                    <span>{event.date.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-2">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-2">
                    <Users className="h-4 w-4" />
                    <span>{event.attendees} attendees</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Register</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="calendar" className="flex-1">
          <div className="flex h-full">
            <div className="w-1/2 p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </div>
            <div className="w-1/2 p-4">
              <h3 className="text-lg font-semibold mb-4">
                Events on {selectedDate?.toDateString()}
              </h3>
              <div className="space-y-4">
                {events
                  .filter(
                    (event) =>
                      event.date.toDateString() === selectedDate?.toDateString()
                  )
                  .map((event) => (
                    <Card key={event.id}>
                      <CardHeader>
                        <CardTitle>{event.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{event.description}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {event.location}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
     
    </div>
  )
}

