"use client"

import Link from "next/link"
import { ArrowRight, MoreHorizontal, Shield, Users } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/src/components/ui/alert-dialog"
import { useState } from "react"

export function RoleCard({
  role,
  onDelete,
  refreshRoles
}: {
  role: any
  onDelete: (id: number) => void
  refreshRoles: () => void
}) {
  const [openConfirm, setOpenConfirm] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <Card key={role.id} className="relative">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{role.name}</CardTitle>
            {role.role_type === "GLOBAL" && (
              <Badge variant="secondary" className="text-xs">
                System
              </Badge>
            )}
          </div>

          <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/roles/${role.id}/edit`}>Edit Role</Link>
                </DropdownMenuItem>
                <DropdownMenuItem>Duplicate Role</DropdownMenuItem>
                <DropdownMenuSeparator />
                {role.role_type !== "GLOBAL" && (
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-destructive">
                      Delete Role
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Role?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this role? This action cannot
                  be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(role.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <Link href={`/roles/${role.id}/assign-users`} className="flex-1">
              <span>{role.user_count} users assigned</span>
            </Link>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">
              Permissions ({role.permissions.length})
            </p>
            <div className="flex flex-wrap gap-1">
              {role.permissions.slice(0, 3).map((p: any) => (
                <Badge
                  key={p.permission_id}
                  variant="outline"
                  className="text-xs"
                >
                  {p.permission
                    ? `${p.permission.namespace}.${p.permission.action}`
                    : p.permission_id}
                </Badge>
              ))}
              {role.permissions.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{role.permissions.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-3">
            <Link href={`/roles/${role.id}/edit`} className="flex-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full flex items-center justify-center"
              >
                Manage Permissions
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
