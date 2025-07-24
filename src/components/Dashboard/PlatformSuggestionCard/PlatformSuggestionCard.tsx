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
import { Users } from "lucide-react"
import { useEffect, useState } from "react"
import Loader from "../../common/Loader/Loader"
import { GetUserRole } from "@/src/utils/helpers"

interface Props {
  authUser: SelectUser
}

export function PlatformSuggestionCard({ authUser }: Props) {
  const [suggestedUsers, setSuggestedUsers] = useState<SelectUser[]>([])
  const [userRole, setUserRole] = useState<SelectRole[]>([])
  const [requestedUserId, setRequestedUserId] = useState<string | null>(null)
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null)

  const [getUsersLoading, , , GetRandomUsers] =
    useServerAction(GetRandomUsersAction)
  const [connectLoading, follow, connectError, createContact] =
    useServerAction(CreateContactAction)

  useEffect(() => {
    const fetchUsers = async () => {
      const result = await GetRandomUsers()

      if (result?.success && result?.data) {
        setSuggestedUsers(result.data)
      }
    }

    fetchUsers()
  }, [])

  const handleConnect = async (user: SelectUser) => {
    if (!authUser?.unique_id || !user.unique_id) return
    setLoadingUserId(user.unique_id)
    try {
      const res = await createContact(user.unique_id)
      if (res?.success) {
        setRequestedUserId(user.unique_id)
        toast({
          title: "Connection Request Sent!",
          duration: 3000
        })
      } else {
        toast({
          variant: "destructive",
          title: "Unable to Connect!",
          description:
            "There was an issue performing the action please try again.",
          duration: 3000
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Unable to Connect!",
        description:
          "There was an issue performing the action please try again.",
        duration: 3000
      })
      console.error("Error creating contact", error)
    } finally {
      setLoadingUserId(null)
    }
  }

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
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage
                      src={suggestion.profile_url ?? ""}
                      alt={suggestion.first_name}
                    />
                    <AvatarFallback>
                      {suggestion.first_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {suggestion.first_name} {suggestion.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {GetUserRole(suggestion) || "No Role"}
                    </p>
                  </div>
                </div>
                {requestedUserId === suggestion.unique_id ? (
                  <>
                    <Button disabled variant="outline" size="sm">
                      Requested
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConnect(suggestion)}
                    loading={loadingUserId === suggestion.unique_id}
                  >
                    Connect
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
