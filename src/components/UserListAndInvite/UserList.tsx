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
  SelectCommunityUser,
  SelectRole,
  SelectSpace,
  SelectSpaceUser,
  SelectUser
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
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import { updateUserRoleForEntityAction } from "@/src/server-actions/UserRoles/UserRole"
import { CommunityDetailData } from "@/src/db/data-access/communities/query"
import { DetachCommunityUserAction } from "@/src/server-actions/Community/Community"

interface Props {
  entityType: "channel" | "space" | "community"
  entity: SelectChannel | SelectSpace | CommunityDetailData
  userList: SelectChannelUser[] | SelectSpaceUser[] | SelectCommunityUser[]
  scopedRoles: SelectRole[]
}

export default function ChannelUserList({
  entity,
  userList,
  entityType,
  scopedRoles
}: Props) {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [usersList, setUsersList] = useState<
    SelectChannelUser[] | SelectSpaceUser[] | SelectCommunityUser[]
  >(userList)
  const [filteredUsers, setFilteredUsers] = useState<
    SelectChannelUser[] | SelectSpaceUser[] | SelectCommunityUser[]
  >(userList)
  const [changeRoleModelVisibility, setChangeRoleModelVisibility] =
    useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<
    SelectChannelUser | SelectSpaceUser | SelectCommunityUser | null
  >(null)
  const [selectedRoleName, setSelectedRoleName] = useState("")
  const authUser = useAtomValue(userStore.AuthUser)
  const isSuperAdmin = useAtomValue(userStore.SuperAdmin)

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
    detachCommunityUserLoading,
    detachCommunityUserData,
    errorDetachCommunityUser,
    DetachCommunityUser
  ] = useServerAction(DetachCommunityUserAction)
  const [
    updateEntityUserRoleLoading,
    updateEntityUserRoleData,
    updateEntityUserRoleError,
    updateUserRoleForEntity
  ] = useServerAction(updateUserRoleForEntityAction)

  useEffect(() => {
    // Explicitly handle filtering based on entityType to maintain type integrity
    if (entityType === "channel") {
      const channelUsers = usersList as SelectChannelUser[]
      const filtered = channelUsers.filter(
        (cu) =>
          cu?.user?.first_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          cu?.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredUsers(filtered)
    } else {
      const spaceUsers = usersList as SelectSpaceUser[]
      const filtered = spaceUsers.filter(
        (cu) =>
          cu?.user?.first_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          cu?.user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredUsers(filtered)
    }
  }, [searchQuery, usersList, entityType]) // Added entityType to dependencies

  const entityName =
    entityType === "channel"
      ? (entity as SelectChannel).channel_name
      : entityType === "community"
        ? (entity as CommunityDetailData).title
        : (entity as SelectSpace).space_name

  const { permissionChecker } = usePermissionChecker(
    "scoped",
    entityType === "channel"
      ? "CHANNEL"
      : entityType === "community"
        ? "COMMUNITY"
        : "SPACE",
    entity.id
  )

  const canInviteUser = permissionChecker
    ? permissionChecker?.canAccess(`${entityType}.user.invite`)
    : false
  const canUpdateUser = permissionChecker
    ? permissionChecker?.canAccess(`${entityType}.user.update`)
    : false
  const canDeleteUser = permissionChecker
    ? permissionChecker?.canAccess(`${entityType}.user.remove`)
    : false

  async function handleUpdateUserRole(userId: string, entityId: string) {
    if (!selectedUser) {
      toast({
        title: "Error",
        description: "No user selected for role update.",
        variant: "destructive"
      })
      return
    }

    const oldRoleName = selectedUser.role

    const oldRole = scopedRoles.find((role) => role.name === oldRoleName)
    const oldRoleId = oldRole ? oldRole.id : null

    if (!selectedRoleName) {
      toast({
        title: "Please select a role",
        variant: "destructive"
      })
      return
    }

    const newRole = scopedRoles.find((role) => role.name === selectedRoleName)

    if (!newRole) {
      toast({
        title: "Selected role not found",
        description: "Please try selecting a different role.",
        variant: "destructive"
      })
      return
    }

    try {
      const updatedUserRoleResponse = await updateUserRoleForEntity(
        userId,
        entityId,
        entityType.toUpperCase() as
          | "CHANNEL"
          | "SPACE"
          | "PROJECT"
          | "COMMUNITY",
        newRole.id,
        oldRoleId ?? 0,
        selectedRoleName
      )

      if (updatedUserRoleResponse?.success) {
        setUsersList((prevUsersList) => {
          if (entityType === "channel") {
            return (prevUsersList as SelectChannelUser[]).map((user) => {
              if (user.user_id === userId) {
                return {
                  ...user,
                  role: newRole.name
                }
              }
              return user
            }) as SelectChannelUser[]
          } else {
            return (prevUsersList as SelectSpaceUser[]).map((user) => {
              if (user.user_id === userId) {
                return {
                  ...user,
                  role: newRole.name
                }
              }
              return user
            }) as SelectSpaceUser[]
          }
        })

        toast({
          title: "User role updated successfully!",
          description: `Role changed from ${oldRoleName || "unknown"} to ${newRole.name}.`,
          duration: 3000
        })
      } else {
        toast({
          title: "Failed to update user role",
          description: "Please try again later.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error updating user role:", error)
      toast({
        title: "Failed to update user role",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive"
      })
    } finally {
      setChangeRoleModelVisibility(false)
      setSelectedUser(null)
      setSelectedRoleName("")
    }
  }

  const handleRemoveUser = async (userId: string, entityId: string) => {
    try {
      if (!canDeleteUser) {
        toast({
          title: "Permission Denied",
          description: "You do not have permission to remove users.",
          variant: "destructive"
        })
        return null
      }

      if (!selectedUser) {
        toast({
          title: "Error",
          description: "No user selected for removal.",
          variant: "destructive"
        })
        return null
      }

      // Find the role object based on the selected user's role name
      const roleToRemove = scopedRoles.find(
        (role) => role.name === selectedUser.role
      )

      if (!roleToRemove) {
        toast({
          title: "Error",
          description:
            "Could not find the role to remove for the selected user.",
          variant: "destructive"
        })
        return null
      }

      let delUser
      if (entityType === "channel") {
        delUser = await DettachChannelUser(entityId, userId, roleToRemove.id)
      } else if (entityType === "space") {
        delUser = await DettachSpaceUser(entityId, userId, roleToRemove.id)
      } else if (entityType === "community") {
        delUser = await DetachCommunityUser(entityId, userId)
      }
      if (delUser?.success) {
        setUsersList((prevUsersList) => {
          if (entityType === "channel") {
            return (prevUsersList as SelectChannelUser[]).filter(
              (cu) => cu.user?.unique_id !== userId
            )
          } else {
            return (prevUsersList as SelectSpaceUser[]).filter(
              (cu) => cu.user?.unique_id !== userId
            )
          }
        })
        toast({
          title: "User removed",
          description: `User has been removed from ${entityName}`,
          variant: "default"
        })
      } else {
        toast({
          title: "Failed to remove user",
          description: "Please try again later.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error removing user:", error)
      toast({
        title: "Failed to remove user",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive"
      })
    } finally {
      setIsAlertOpen(false)
      setSelectedUser(null)
    }
  }

  const isScopedAdminFn = (user?: SelectUser) => {
    if (user?.roles) {
      return user.roles.some(
        (role) =>
          role.role?.slug?.includes("admin") &&
          role.role.entity_id === entity?.id
      )
    }
    return false
  }

  const canChangeUserAminRole = (targetUser: SelectUser | undefined) => {
    if (!targetUser) return false

    if (targetUser.unique_id === authUser?.unique_id) return false

    const isTargetScopedAdmin = isScopedAdminFn(targetUser)
    const isAuthScopedAdmin = isScopedAdminFn(authUser || undefined)

    if (isTargetScopedAdmin) {
      return isSuperAdmin || isAuthScopedAdmin
    }

    return true
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
        {canInviteUser && (
          <Button onClick={() => setIsInviteDialogOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite User
          </Button>
        )}
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
            Manage all users across your {entityType}. {usersList.length} users
            total.
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
                      {(canUpdateUser || canDeleteUser) && (
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
                            {canUpdateUser && canChangeUserAminRole(user) && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(cu)
                                  setSelectedRoleName(cu.role || "")
                                  setChangeRoleModelVisibility(true)
                                }}
                              >
                                Change Role
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {canDeleteUser && (
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  setSelectedUser(cu)
                                  setIsAlertOpen(true)
                                }}
                              >
                                Remove User
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
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
                    setSelectedRoleName(value)
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
                    {scopedRoles.map((role) => (
                      <SelectItem key={role.id} value={role.name}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              loading={updateEntityUserRoleLoading}
              onClick={() => {
                if (selectedUser?.user_id) {
                  handleUpdateUserRole(selectedUser.user_id, entity.id)
                }
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
