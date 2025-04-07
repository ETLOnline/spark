"use client"

import { useEffect, useState } from "react"
import { MoreHorizontal, Search, UserPlus } from "lucide-react"

import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import { InviteUserDialog } from "./UserInviteDialog"
import { SelectChannel, SelectChannelUser, SelectUser } from "@/src/db/schema"
import { getUserRoles } from "@/src/utils/helpers"
import { useAtomValue } from "jotai"
import { userStore } from "@/src/store/user/userStore"

interface Props {
  channel: SelectChannel
  userList: SelectChannelUser[]
}

export default function ChannelUserList({channel, userList}: Props) {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [channelUsers, setChannelUsers] = useState<SelectChannelUser[]>(userList)
  const [filteredUsers, setFilteredUsers] = useState<SelectChannelUser[]>(userList)
  const authUser = useAtomValue(userStore.AuthUser)

  useEffect(()=>{
    const filtered = channelUsers.filter(
      (cu) =>
        cu?.user?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cu?.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredUsers(filtered)
  },[searchQuery, channelUsers])

  const handleRemoveUser = async () => {
    // if (authUser){

    // }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button onClick={() => setIsInviteDialogOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>All Users</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-8 w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <CardDescription>Manage all users across your channel. {channelUsers.length} users total.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-12 p-4 bg-muted font-medium">
              <div className="col-span-4">User</div>
              <div className="col-span-4">Email</div>
              <div className="col-span-3">Role</div>
              <div className="col-span-1">Actions</div>
            </div>
            <div className="divide-y">
              {filteredUsers.map((cu) => {
                const user = cu.user
                if (!user) return null
                return(
                  <div key={user.unique_id} className="grid grid-cols-12 p-4 items-center">
                    <div className="col-span-4 flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.profile_url || undefined} alt={user.first_name} />
                        <AvatarFallback>
                          {user.first_name.charAt(0)}
                          {user.first_name.split(" ")[1]?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{user.first_name}</div>
                    </div>
                    <div className="col-span-4 text-sm text-muted-foreground">{user.email}</div>
                    <div className="col-span-3 flex items-center gap-1">
                      <Badge  variant={cu.role === "admin" ? "default" : "outline"}>{cu.role}</Badge>
                    </div>
                    <div className="col-span-1 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">More options</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Change Role</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleRemoveUser()}>Remove User</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )
              })}

              {filteredUsers.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">No users found matching your search.</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <InviteUserDialog 
        open={isInviteDialogOpen} 
        onOpenChange={setIsInviteDialogOpen} 
        spaceName="Platform" 
        type={['link']}
        entityType="channel" 
        entity={channel}
      />
    </div>
  )
}

