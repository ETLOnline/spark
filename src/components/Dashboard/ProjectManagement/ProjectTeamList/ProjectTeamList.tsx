"use client"

import { SelectProjectUser, SelectUser } from "@/src/db/schema"
import { useEffect, useState } from "react"
import { Button } from "@/src/components/ui/button"
import MultiSelect, {
  MultiSelectOption
} from "@/src/components/ui/multi-select"
import { toast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  AttachProjectUserAction,
  RemoveProjectUserAction
} from "@/src/server-actions/ProjectManagement/projectManagement"
import { GetSpaceUsersAction } from "@/src/server-actions/Space/Space"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"
import { MoreHorizontal, PlusCircle } from "lucide-react"
import { Badge } from "@/src/components/ui/badge"
import { useAtomValue } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { Label } from "@/src/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/src/components/ui/select"
import {
  getRoleByEntityTypeAndIdAction,
  updateUserRoleForEntityAction
} from "@/src/server-actions/UserRoles/UserRole"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"

export interface ProjectUser extends SelectProjectUser {
  user: SelectUser & Partial<{ role: string; bio: string | null }>
}

interface Props {
  projectId: string
  spaceId: string
  projectUsers: ProjectUser[]
  projectCreatorId: string
}

export default function ProjectTeamList({
  projectId,
  spaceId,
  projectUsers = [],
  projectCreatorId
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [spaceUsers, setSpaceUsers] = useState<SelectUser[]>([])
  const [selectedUsers, setSelectedUsers] = useState<MultiSelectOption[]>([])
  const [usersList, setUsersList] = useState<ProjectUser[]>(projectUsers)
  const isSuperAdmin = useAtomValue(userStore.SuperAdmin)

  const [attachUserLoading, , , AttachUser] = useServerAction(
    AttachProjectUserAction
  )
  const [removeUserLoading, , , RemoveUser] = useServerAction(
    RemoveProjectUserAction
  )
  const [updateProjectUserRoleLoading, , , callUpdateUserRoleForEntity] =
    useServerAction(updateUserRoleForEntityAction)
  const [spaceRolesLoading, spaceRolesData, spaceRolesError, fetchSpaceRoles] =
    useServerAction(getRoleByEntityTypeAndIdAction)

  useEffect(() => {
    if (projectId) {
      fetchSpaceRoles("PROJECT", projectId)
    }
  }, [projectId])

  const isScopedAdminFn = (user?: SelectUser) => {
    if (user?.roles) {
      return user.roles.some(
        (role) =>
          role.role?.slug?.includes("admin") &&
          role.role.entity_id === projectId
      )
    }
    return false
  }

  const canChangeUserRole = (targetUser: SelectUser | undefined) => {
    if (!targetUser) return false

    if (targetUser.unique_id === authUser?.unique_id) return false

    if (isSuperAdmin) return true

    if (targetUser.unique_id === projectCreatorId) return false

    if (authUser?.unique_id === projectCreatorId) return true

    if (isScopedAdminFn(authUser || undefined)) {
      if (
        targetUser.unique_id === projectCreatorId ||
        isScopedAdminFn(targetUser)
      ) {
        return false
      }
      return true
    }

    return false
  }

  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<ProjectUser | null>(null)
  const [newRoleName, setNewRoleName] = useState<string>("member") // Renamed to newRoleName to clarify it's the name

  const authUser = useAtomValue(userStore.AuthUser)
  const isProjectCreator = authUser?.unique_id == projectCreatorId

  useEffect(() => {
    async function fetchUsers() {
      const result = await GetSpaceUsersAction(spaceId)
      if (result.success && result.data) {
        setSpaceUsers(result.data.map((su) => su.user))
      }
    }
    fetchUsers()
  }, [spaceId])

  const handleAddUsers = async () => {
    const userIdsToAttach = selectedUsers.map((user) => user.value)
    if (userIdsToAttach.length === 0) {
      toast({ title: "No users selected to add." })
      setSelectedUsers([])
      setDialogOpen(false)
      return
    }

    try {
      const response = await AttachUser(projectId, userIdsToAttach)

      if (response?.success && response.data) {
        const newlyAttachedProjectUsers: ProjectUser[] = []

        for (const attachedUser of response.data) {
          const matchingUser = spaceUsers.find(
            (u) => u.unique_id === attachedUser.user_id
          )
          if (!matchingUser) {
            console.warn(
              `User with ID ${attachedUser.user_id} not found in spaceUsers after attachment.`
            )
            continue
          }

          const newProjectUser: ProjectUser = {
            id: attachedUser.id,
            project_id: attachedUser.project_id,
            user_id: attachedUser.user_id,
            role: attachedUser.role ?? "member",
            status: attachedUser.status ?? "active",
            updated_at: attachedUser.updated_at ?? null,
            created_at: attachedUser.created_at ?? null,
            deleted_at: attachedUser.deleted_at ?? null,
            user: matchingUser
          }
          newlyAttachedProjectUsers.push(newProjectUser)
        }
        setUsersList((prev) => [...prev, ...newlyAttachedProjectUsers])

        if (
          response.failedRoleAssignments &&
          response.failedRoleAssignments.length > 0
        ) {
          toast({
            title: `Successfully added some users, but roles could not be assigned for: ${response.failedRoleAssignments.join(", ")}.`,
            variant: "destructive",
            duration: 3000
          })
        } else {
          toast({ title: "User(s) added successfully!" })
        }
      } else {
        console.error(
          `Failed to attach users to project ${projectId}. Response:`,
          response
        )
        toast({
          title: response?.error
            ? `Failed to add users: ${response.error}`
            : "Failed to add users. Please try again.",
          variant: "destructive"
        })
      }
    } catch (error: any) {
      toast({
        title: `An unexpected error occurred: ${error.message || "Please try again."}`,
        variant: "destructive"
      })
    } finally {
      setSelectedUsers([])
      setDialogOpen(false)
    }
  }

  const handleRemoveUser = async (userId: string, roleName: string) => {
    try {
      if (!roleName) {
        toast({
          title: "Error",
          description: "No user selected for removal.",
          variant: "destructive"
        })
        return
      }

      // Find the role object based on the selected user's current role name
      const roleToRemove = spaceRolesData?.data?.find(
        (role) => role.name === roleName
      )

      if (!roleToRemove) {
        toast({
          title: "Error",
          description: "Could not find the role for the selected user.",
          variant: "destructive"
        })
        return
      }

      // Pass the projectId, userId, and the roleToRemove.id to the RemoveUser action
      const response = await RemoveUser(projectId, userId, roleToRemove.id)

      if (response?.success) {
        setUsersList((prev) => prev.filter((user) => user.user_id !== userId))
        toast({ title: "User removed from project" })
      } else {
        toast({
          title: "Error",
          description: "Could not remove user",
          variant: "destructive"
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Could not remove user",
        variant: "destructive"
      })
    }
  }

  const handleSaveRole = async () => {
    if (!selectedUser) {
      toast({ title: "No user selected", variant: "destructive" })
      return
    }
    const newRoleObj = spaceRolesData?.data?.find(
      (role) => role.name === newRoleName
    )

    if (!newRoleObj) {
      toast({ title: "Selected role not found", variant: "destructive" })
      return
    }

    const oldRoleObj = spaceRolesData?.data?.find(
      (role) => role.name === selectedUser.role
    )
    const oldRoleId = oldRoleObj ? oldRoleObj.id : null

    try {
      const response = await callUpdateUserRoleForEntity(
        // <-- Using the new server action
        selectedUser.user_id,
        projectId,
        "PROJECT",
        newRoleObj.id,
        oldRoleId ?? 0,
        newRoleName
      )

      if (response?.success) {
        setUsersList((prev) =>
          prev.map((u) =>
            u.user_id === selectedUser.user_id ? { ...u, role: newRoleName } : u
          )
        )
        toast({ title: "Role updated successfully" })
        setRoleDialogOpen(false)
      } else {
        toast({ title: "Failed to update role", variant: "destructive" })
      }
    } catch (error) {
      console.error("Error updating project user role:", error)
      toast({
        title: "Failed to update role",
        description: "An unexpected error occurred.",
        variant: "destructive"
      })
    }
  }

  const projectUserIds = new Set(usersList.map((u) => u.user_id))

  const availableSpaceUsers = spaceUsers.filter(
    (spaceUser) => !projectUserIds.has(spaceUser.unique_id)
  )

  const options: MultiSelectOption[] = availableSpaceUsers.map((u) => ({
    label: `${u.first_name} ${u.last_name}`,
    value: u.unique_id
  }))

  // PERMISSIONS INITATE
  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "PROJECT",
    projectId
  )
  const canView = permissionChecker
    ? permissionChecker?.canAccess("project.teams.view")
    : false
  const canCreate = permissionChecker
    ? permissionChecker?.canAccess("project.teams.add")
    : false
  const canUpdate = permissionChecker
    ? permissionChecker?.canAccess("project.teams.update")
    : false
  const canDelete = permissionChecker
    ? permissionChecker?.canAccess("project.teams.delete")
    : false

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Project Team</h1>
        {canCreate && (
          <Button onClick={() => setDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Users
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Project Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-12 p-4 bg-muted font-medium">
              <div className="col-span-4">User</div>
              <div className="col-span-4">Email</div>
              <div
                className={
                  isScopedAdminFn(authUser || undefined) || isSuperAdmin
                    ? "col-span-3"
                    : "col-span-4 text-center"
                }
              >
                Role
              </div>
              {isScopedAdminFn(authUser || undefined) || isSuperAdmin ? (
                <div className="col-span-1 text-center">Actions</div>
              ) : null}
            </div>
            <div className="divide-y">
              {usersList.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No users in project yet.
                </div>
              ) : (
                canView &&
                usersList.map((cu) => {
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
                            src={user.profile_url ?? undefined}
                            alt={user.first_name}
                          />
                          <AvatarFallback>
                            {user.first_name.charAt(0)}
                            {user.last_name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{user.first_name}</div>
                      </div>
                      <div className="col-span-4 text-sm text-muted-foreground">
                        {user.email}
                      </div>
                      <div
                        className={
                          isScopedAdminFn(authUser || undefined) || isSuperAdmin
                            ? "col-span-3 flex gap-1"
                            : "col-span-4  gap-1"
                        }
                      >
                        <div className="flex flex-col items-center">
                          <Badge
                            className="capitalize"
                            variant={
                              cu.role === "admin" ? "default" : "outline"
                            }
                          >
                            {cu.role}
                          </Badge>
                          {user.unique_id === projectCreatorId ? (
                            <Badge variant="outline">{"(Creator)"}</Badge>
                          ) : null}
                        </div>
                      </div>
                      {isScopedAdminFn(authUser || undefined) ||
                      isSuperAdmin ? (
                        <div className="col-span-1 text-center">
                          {canChangeUserRole(user) ? (
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
                                {canUpdate && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedUser(cu)
                                      setNewRoleName(cu.role ?? "member")
                                      setRoleDialogOpen(true)
                                    }}
                                  >
                                    Change Role
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                {canDelete && (
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => {
                                      setSelectedUser(cu)
                                      handleRemoveUser(
                                        cu.user_id,
                                        cu.role ?? ""
                                      )
                                    }}
                                  >
                                    Remove User
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <span className="text-muted-foreground text-xs">
                              -
                            </span>
                          )}
                        </div>
                      ) : null}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Users Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Add Users to Project</DialogTitle>
          </DialogHeader>
          <MultiSelect
            className="w-full"
            options={options}
            selected={selectedUsers}
            onChange={setSelectedUsers}
            placeholder="Search and select users"
          />
          <Button
            className="mt-4 w-full"
            onClick={handleAddUsers}
            disabled={selectedUsers.length === 0 || attachUserLoading}
          >
            Add Selected Users
          </Button>
        </DialogContent>
      </Dialog>
      {/* Change Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="channel_type">User Role</Label>
              <div className="w-[70%]">
                <Select
                  onValueChange={(value) => {
                    setNewRoleName(value)
                  }}
                  defaultValue={selectedUser?.role || ""}
                  value={newRoleName}
                >
                  <SelectTrigger>
                    <SelectValue
                      className="capitalize"
                      placeholder="Select Role"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {spaceRolesData &&
                      spaceRolesData.data &&
                      spaceRolesData.data.map((role) => (
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
              loading={updateProjectUserRoleLoading}
              onClick={handleSaveRole}
            >
              {" "}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
