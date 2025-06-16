"use client"

import { useState, useEffect } from "react"
import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"
import MultiSelect, {
  MultiSelectOption
} from "@/src/components/ui/multi-select"
import { useServerAction } from "@/src/hooks/useServerAction"
import { attachUsersToRoleAction } from "@/src/server-actions/UserRoles/UserRole"
import { toast } from "@/src/hooks/use-toast"
import { getOptionsFromUserList } from "@/src/utils/helpers"
import { GetUserContactsAction } from "@/src/server-actions/User/User"

interface AttachUsersToRoleDialogProps {
  roleId: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AttachUsersToRoleDialog({
  roleId,
  open,
  onOpenChange,
  onSuccess
}: AttachUsersToRoleDialogProps) {
  const [selectedUsers, setSelectedUsers] = useState<MultiSelectOption[]>([])
  const [options, setOptions] = useState<MultiSelectOption[]>([])
  const [attaching, , , AttachUsers] = useServerAction(attachUsersToRoleAction)

  // Fetch connected users
  const fetchConnectedUsers = async () => {
    const result = await GetUserContactsAction()
    if (result?.success && result.data) {
      const userOptions = getOptionsFromUserList(result.data)
      setOptions(userOptions)
    } else {
      setOptions([])
    }
  }

  useEffect(() => {
    if (open) {
      fetchConnectedUsers()
    }
  }, [open])

  const handleAttachUsers = async () => {
    const userIds = selectedUsers.map((u) => u.value)
    const res = await AttachUsers(roleId, userIds)

    if (res?.success) {
      toast({ title: "Users attached to role successfully" })
      onOpenChange(false)
      setSelectedUsers([])
      setOptions([])
      if (onSuccess) onSuccess()
    } else {
      toast({ title: "Failed to attach users", variant: "destructive" })
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedUsers([])
      setOptions([])
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Attach Users to Role</DialogTitle>
        </DialogHeader>
        <MultiSelect
          className="w-full"
          options={options}
          selected={selectedUsers}
          onChange={setSelectedUsers}
          placeholder="Search and select users"
          loading={false}
        />
        <Button
          className="mt-4 w-full"
          onClick={handleAttachUsers}
          disabled={selectedUsers.length === 0 || attaching}
        >
          {attaching ? "Attaching..." : "Attach Users"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
