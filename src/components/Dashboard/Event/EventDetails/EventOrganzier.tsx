import { Avatar, AvatarImage, AvatarFallback } from "@/src/components/ui/avatar"
import { Card, CardContent } from "@/src/components/ui/card"
import { hostStore } from "@/src/store/host/hostStore"
import { useAtomValue } from "jotai"

export function EventOrganizer({
  hostName,
  profile_url
}: {
  hostName: string
  profile_url: string | null
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="font-semibold mb-3">Organizer</h3>
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12">
            {profile_url && <AvatarImage src={profile_url} alt={hostName} />}
            <AvatarFallback className="bg-gray-300 text-gray-700">
              {hostName?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">
              Organizer: {hostName || "Loading..."}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
