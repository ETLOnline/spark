"use client"

import { useEffect, useState } from "react"
import {
  ArrowBigRightDash,
  MoreHorizontal,
  Search,
  UserPlus
} from "lucide-react"

import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu"
import { InviteUserDialog } from "./UserInviteDialog"
import {
  SelectChannel,
  SelectChannelUser,
  SelectSpace,
  SelectSpaceUser
} from "@/src/db/schema"
import { useAtomValue } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  DettachChannelUserAction,
  UpdateChannelUserAction
} from "@/src/server-actions/Channel/Channel"
import {
  DetachSpaceUserAction,
  UpdateSpaceUserAction
} from "@/src/server-actions/Space/Space"
import Link from "next/link"
import { toast } from "@/src/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "../ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../ui/select"
import { Label } from "../ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "../ui/alert-dialog"
import { SpaceUserRole } from "../common/types/spaceuser.role"

interface Props {
  entityType: "channel" | "space"
  entity: SelectChannel | SelectSpace
  userList: SelectChannelUser[] | SelectSpaceUser[]
}

export default function ChannelUserList({
  entity,
  userList,
  entityType
}: Props) {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [usersList, setUsersList] = useState(userList)
  const [filteredUsers, setFilteredUsers] = useState<
    SelectChannelUser[] | SelectSpaceUser[]
  >(userList)
  const [changeRoleModelVisibility, setChangeRoleModelVisibility] =
    useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<
    SelectChannelUser | SelectSpaceUser | null
  >(null)
  const [userRole, setUserRole] = useState("")
  const authUser = useAtomValue(userStore.AuthUser)
  const [
    dettachChannelUserLoading,
    dettachChannelUserData,
    errorDettachChannelUser,
    DettachChannelUser
  ] = useServerAction(DettachChannelUserAction)
  const [
    dettachSpaceUserLoading,
    dettachSpaceUserData,
    errorDettachSpaceUser,
    DettachSpaceUser
  ] = useServerAction(DetachSpaceUserAction)
  const [
    updateChannelUserLoading,
    updateChannelUserData,
    updateChannelUserError,
    UpdateChannelUser
  ] = useServerAction(UpdateChannelUserAction)
  const [
    updateSpaceUserLoading,
    updateSpaceUserData,
    updateSpaceUserError,
    UpdateSpaceUser
  ] = useServerAction(UpdateSpaceUserAction)

  useEffect(() => {
    const filtered = usersList.filter(
      (cu) =>
        cu?.user?.first_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        cu?.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredUsers(
      entityType === "channel"
        ? (filtered as SelectChannelUser[])
        : (filtered as SelectSpaceUser[])
    )
  }, [searchQuery, usersList])

  const entityName =
    entityType === "channel"
      ? (entity as SelectChannel).channel_name
      : (entity as SelectSpace).space_name

  async function handleUpdateuser(userId: string, entityId: string) {
    try {
      if (userRole) {
        if (entityType === "channel") {
          const updatedChannelUser = await UpdateChannelUser(entityId, userId, {
            role: userRole
          })
          if (updatedChannelUser?.success && updatedChannelUser.data) {
            setUsersList((prev) => {
              return (prev as SelectChannelUser[]).map((user) => {
                return user.user_id === userId
                  ? { ...user, ...updatedChannelUser.data }
                  : user
              })
            })
          }
        } else {
          const updatedSpaceUser = await UpdateSpaceUser(entityId, userId, {
            role: userRole
          })
          if (updatedSpaceUser?.success && updatedSpaceUser.data) {
            setUsersList((prev) => {
              return (prev as SelectSpaceUser[]).map((user) => {
                return user.user_id === userId
                  ? { ...user, ...updatedSpaceUser?.data }
                  : user
              })
            })
          }
        }
        toast({
          title: "User updated",
          duration: 3000
        })
      }
    } catch {
      console.error("Error updating user")
      toast({
        title: "Failed to update user",
        description: "Please try again later.",
        variant: "destructive"
      })
    } finally {
      setChangeRoleModelVisibility(false)
    }
  }

  const handleRemoveUser = async (userId: string, entityId: string) => {
    try {
      if (authUser?.role.includes("admin")) {
        let delUser
        if (entityType === "channel") {
          delUser = await DettachChannelUser(entityId, userId)
        } else {
          delUser = await DettachSpaceUser(entityId, userId)
        }
        if (delUser?.success) {
          setUsersList((prev) => {
            if (entityType === "channel") {
              return (prev as SelectChannelUser[]).filter(
                (cu) => cu.user?.unique_id !== userId
              )
            } else {
              return (prev as SelectSpaceUser[]).filter(
                (cu) => cu.user?.unique_id !== userId
              )
            }
          })
          toast({
            title: "User removed",
            description: `User has been removed from ${entityName}`,
            variant: "default"
          })
        }
        return null
      }
    } catch {
      console.error("Error removing user")
    } finally {
      setIsAlertOpen(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <Link
            href={
              entityType === "channel"
                ? `/channels/${(entity as SelectChannel).channel_slug}/spaces`
                : `/channels/${(entity as SelectSpace).channel?.channel_slug}/spaces/${(entity as SelectSpace).space_slug}`
            }
          >
            <h1 className="text-2xl font-bold">{entityName}</h1>
          </Link>
          <ArrowBigRightDash />
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>
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
          <CardDescription>
            Manage all users across your{" "}
            {entityType === "channel" ? "channel" : "space"}. {usersList.length}{" "}
            users total.
          </CardDescription>
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
                return (
                  <div
                    key={user.unique_id}
                    className="grid grid-cols-12 p-4 items-center"
                  >
                    <div className="col-span-4 flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={user.profile_url || undefined}
                          alt={user.first_name}
                        />
                        <AvatarFallback>
                          {user.first_name.charAt(0)}
                          {user.first_name.split(" ")[1]?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{user.first_name}</div>
                    </div>
                    <div className="col-span-4 text-sm text-muted-foreground">
                      {user.email}
                    </div>
                    <div className="col-span-3 flex items-center gap-1">
                      <Badge
                        className="capitalize"
                        variant={
                          cu.role === SpaceUserRole.Admin
                            ? "default"
                            : "outline"
                        }
                      >
                        {cu.role}
                      </Badge>
                    </div>
                    <div className="col-span-1 text-center">
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
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(cu)
                              setChangeRoleModelVisibility(true)
                            }}
                          >
                            Change Role
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSelectedUser(cu)
                              setIsAlertOpen(true)
                            }}
                          >
                            Remove User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )
              })}

              {filteredUsers.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No users found matching your search.
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={changeRoleModelVisibility}
        onOpenChange={setChangeRoleModelVisibility}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="channel_type">User Role</Label>
              <div className="w-[70%]">
                <Select
                  onValueChange={(value) => {
                    setUserRole(value)
                  }}
                  defaultValue={selectedUser?.role || ""}
                >
                  <SelectTrigger>
                    <SelectValue
                      className="capitalize"
                      placeholder="Select Role"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SpaceUserRole.Admin}>Admin</SelectItem>
                    <SelectItem value={SpaceUserRole.Member}>Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              loading={updateChannelUserLoading || updateSpaceUserLoading}
              onClick={() => {
                handleUpdateuser(selectedUser?.user_id || "", entity.id)
              }}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will remove the user from {entityName}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedUser?.user_id) {
                  handleRemoveUser(selectedUser.user_id, entity.id)
                }
              }}
              loading={dettachChannelUserLoading || dettachSpaceUserLoading}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <InviteUserDialog
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        spaceName="Platform"
        type={["link"]}
        entityType={entityType}
        entity={entity}
      />
    </div>
  )
}
