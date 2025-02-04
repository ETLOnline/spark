import { useEffect, useState } from "react"
import { Bell } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover"
import { Button } from "../../ui/button"
import NotificationItem from "../NotificationItem/NotifictionItem"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetConnectionRequestsAction } from "@/src/server-actions/Contact/Contact"

const Notifications: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)

  const [reqsLoading, reqs, reqsError, getReqs] = useServerAction(
    GetConnectionRequestsAction
  )

  useEffect(() => {
    getReqs()
  }, [])

  const notifications =
    reqs && reqs.data
      ? [...reqs.data.incoming, ...reqs.data.outgoing].sort((a, b) => {
          return (
            new Date(b.updated_at ?? (b.created_at as string)).getTime() -
            new Date(a.updated_at ?? (a.created_at as string)).getTime()
          )
        })
      : []

  useEffect(() => {
    console.log(reqs)
  }, [reqs])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end" sideOffset={5}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="max-h-[300px] overflow-auto">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.user_id + notification.contact_id}
                activity={notification}
                size="sm"
              />
            ))}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  )
}

export default Notifications
