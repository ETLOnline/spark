"use client"

import { useEffect, useState } from "react"
import { RolesHeader } from "@/src/components/Dashboard/Roles/RolesHeader"
import { RoleCard } from "@/src/components/Dashboard/Roles/RoleCard"
import { CreateRoleDialog } from "@/src/components/Dashboard/Roles/CreateRoleDialog"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  deleteRoleAction,
  getAllGlobalAndScopeRolesAction
} from "@/src/server-actions/UserRoles/UserRole"
import { Shield } from "lucide-react"
import NoDataCard from "@/src/components/Dashboard/Channels/ChannelDetails/NoDataCard"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"

export default function RolesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [loading, rolesData, error, fetchRoles] = useServerAction(
    getAllGlobalAndScopeRolesAction
  )
  const [deleting, deleteRes, deleteErr, triggerDeleteRole] =
    useServerAction(deleteRoleAction)

  useEffect(() => {
    const fetchingRoles = async () => {
      const res = await fetchRoles()
    }
    fetchingRoles()
  }, [])

  const roles =
    rolesData?.success && Array.isArray(rolesData.data) ? rolesData.data : []

  const handleDeleteRole = async (roleId: number) => {
    console.log("Deleting role:", roleId)
    const res = await triggerDeleteRole(roleId)
    if (res?.success) {
      await fetchRoles()
    } else {
      console.error("Delete failed:", res?.error)
      alert("Failed to delete the role. Please try again.")
    }
  }

  return (
    <div className="p-6">
      <RolesHeader onCreate={() => setIsCreateDialogOpen(true)} />

      {loading ? (
        <div className="flex justify-center h-full w-full">
          <Loader size={LoaderSizes.xl} />
        </div>
      ) : error || !rolesData?.success || roles.length === 0 ? (
        <NoDataCard
          icon={<Shield className="h-16 w-16 text-muted-foreground mb-4" />}
          title="Roles not found"
          description="Roles not available at the moment, or might have been disabled by the admin"
        />
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <RoleCard
              key={role.id}
              role={role}
              onDelete={handleDeleteRole}
              refreshRoles={fetchRoles}
            />
          ))}
        </div>
      )}

      <CreateRoleDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  )
}
