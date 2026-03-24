"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { CreateRoleAction } from "@/src/server-actions/UserRoles/UserRole"
import { useServerAction } from "@/src/hooks/useServerAction"

interface CreateRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateRoleDialog({
  open,
  onOpenChange
}: CreateRoleDialogProps) {
  const [createRoleLoading, createRoleData, createRoleError, runCreateRole] =
    useServerAction(CreateRoleAction)
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const dataWithRoleType = {
      ...formData,
      roleType: "GLOBAL"
    }
    const result = await runCreateRole(dataWithRoleType)

    if (result?.success) {
      onOpenChange(false)
      setFormData({ name: "" })
      router.push(`/admin/roles/${result.data.id}/edit`)
    } else {
      // handle error (show toast, etc.)
      console.error("Failed to create role:", result?.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Role</DialogTitle>
          <DialogDescription>
            Create a new role and assign permissions to it. You'll be able to
            configure permissions after creating the role.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="role-name">Role Name</Label>
              <Input
                id="role-name"
                placeholder="e.g., Content Manager"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createRoleLoading}>
              {createRoleLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create & Configure"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
