"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import {
  SelectRole,
  SelectUser,
  SelectUserContact,
  SelectUserRole
} from "@/src/db/schema"
import { toast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"
import { CreatePrivateChatAction } from "@/src/server-actions/Chat/Chat"
import { CreateContactAction } from "@/src/server-actions/Contact/Contact"
import { GetRandomUsersAction } from "@/src/server-actions/User/User"
import { Eye, Users } from "lucide-react"
import { useEffect, useState } from "react"
import Loader from "../../common/Loader/Loader"
import { getUserRole } from "@/src/utils/helpers"
import { useRouter } from "next/navigation"
import Link from "next/link"
interface Props {
  authUser: SelectUser
}

export function PlatformSuggestionCard({ authUser }: Props) {
  const [suggestedUsers, setSuggestedUsers] = useState<SelectUser[]>([])
  const [requestedUserId, setRequestedUserId] = useState<string | null>(null)

  const [getUsersLoading, , , GetRandomUsers] =
    useServerAction(GetRandomUsersAction)

  const router = useRouter()

  useEffect(() => {
    const fetchUsers = async () => {
      const result = await GetRandomUsers()

      if (result?.success && result?.data) {
        setSuggestedUsers(result.data)
      }
    }

    fetchUsers()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-4 w-4" />
          Suggested Connections
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {getUsersLoading ? (
            <div className="flex items-center justify-center">
              <Loader />
            </div>
          ) : (
            suggestedUsers.map((suggestion) => (
              <div
                key={suggestion.unique_id}
                className="flex items-center justify-between gap-1 "
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <Avatar>
                    <AvatarImage
                      src={suggestion.profile_url ?? ""}
                      alt={suggestion.first_name}
                    />
                    <AvatarFallback>
                      {suggestion.first_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate line-clamp-2">
                      {suggestion.first_name} {suggestion.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground break-words line-clamp-2">
                      {getUserRole(suggestion) || "No Role"}
                    </p>
                  </div>
                </div>

                <Link href={`/profile/${suggestion.unique_id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className=" h-4 w-4" />
                    View
                  </Button>
                </Link>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
