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
  RemoveProjectUserAction,
  UpdateProjectUserRoleAction
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
import { ProjectUserRole } from "@/src/components/common/types/projectuser.role"
import { useAtomValue } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { projectStore } from "@/src/store/project/projectStore"
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
    for (const user of selectedUsers) {
      const response = await AttachUser(projectId, user.value)
      if (response?.success && response.data) {
        const matchingUser = spaceUsers.find((u) => u.unique_id === user.value)
        if (!matchingUser) continue

        const newProjectUser: ProjectUser = {
          id: response.data.id,
          project_id: response.data.project_id,
          user_id: response.data.user_id,
          role: response.data.role ?? "member",
          status: response.data.status ?? "active",
          updated_at: response.data.updated_at ?? null,
          created_at: response.data.created_at ?? null,
          deleted_at: response.data.deleted_at ?? null,
          user: matchingUser
        }
        setUsersList((prev) => [...prev, newProjectUser])
      }
    }
    toast({ title: "Users added to project" })
    setSelectedUsers([])
    setDialogOpen(false)
  }

  const handleRemoveUser = async (userId: string) => {
    try {
      const response = await RemoveUser(projectId, userId)
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

  const options: MultiSelectOption[] = spaceUsers.map((u) => ({
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
              <div className="col-span-3">Role</div>
              <div className="col-span-1 text-center">Actions</div>
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
                      <div className="col-span-3 flex items-center gap-1">
                        <Badge
                          className="capitalize"
                          variant={cu.role === "admin" ? "default" : "outline"}
                        >
                          {cu.role}
                        </Badge>
                      </div>
                      <div className="col-span-1 text-center">
                        {isProjectCreator || canUpdate || canDelete ? (
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
                                    setNewRoleName(cu.role ?? "member") // Set initial value for new role select
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
                                  onClick={() => handleRemoveUser(cu.user_id)}
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
        <DialogContent>
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
              {/* <-- Changed loading prop */}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
