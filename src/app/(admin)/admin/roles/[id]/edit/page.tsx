"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { CheckCircle2, Shield } from "lucide-react"
import Link from "next/link"
import RoleSummary from "@/src/components/Dashboard/Roles/Edit/RoleSummary"
import PermissionsForm from "@/src/components/Dashboard/Roles/Edit/PermissionsForm"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  GetPermissionCategoriesAction,
  GetRoleWithPermissionsAction,
  SaveRoleWithPermissionsAction
} from "@/src/server-actions/UserRoles/UserRole"
import { useToast } from "@/src/hooks/use-toast"
import NoDataCard from "@/src/components/Dashboard/Channels/ChannelDetails/NoDataCard"
import { RoleWithPermissions } from "@/src/utils/helpers"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"

export default function EditRolePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const numericId = Number(id)
  const { toast } = useToast()

  const router = useRouter()
  const [role, setRole] = useState<RoleWithPermissions | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    permissions: [] as number[]
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [hasChanges, setHasChanges] = useState(false)

  const [loading, permissionCategories, error, fetchPermissions] =
    useServerAction(GetPermissionCategoriesAction)
  const [roleLoading, roleData, roleError, fetchRoleWithPermissions] =
    useServerAction(GetRoleWithPermissionsAction)
  const [saving, saveResponse, saveError, saveRoleWithPermissions] =
    useServerAction(SaveRoleWithPermissionsAction)

  useEffect(() => {
    const fetchData = async () => {
      const resPermissions = await fetchPermissions()
      const resRole = await fetchRoleWithPermissions(numericId)

      if (resRole?.success && resRole.data) {
        setRole(resRole.data)
        setFormData({
          name: resRole.data.name,
          permissions: [...resRole.data.permissions]
        })
      }
    }

    fetchData()
  }, [numericId])

  useEffect(() => {
    if (role) {
      const hasNameChanged = formData.name !== role.name
      const hasPermissionsChanged =
        formData.permissions.length !== role.permissions.length ||
        formData.permissions.some((p) => !role.permissions.includes(p))

      setHasChanges(hasNameChanged || hasPermissionsChanged)
    }
  }, [formData, role])

  const handleSave = async () => {
    if (!role) return

    const res = await saveRoleWithPermissions(
      role.id,
      formData.name,
      formData.permissions
    )

    if (res && res.success) {
      toast({
        title: "Roles and Permission updated successfully",
        duration: 3000
      })
      router.push("/admin/roles")
    } else {
      console.error("❌ Failed to update role", res?.error)
    }
  }

  if (roleLoading || loading) {
    return (
      <div className="flex justify-center h-full w-full">
        <Loader size={LoaderSizes.xl} />
      </div>
    )
  }

  if (!role) {
    return (
      <NoDataCard
        icon={<Shield className="h-16 w-16 text-muted-foreground mb-4" />}
        title="Feature not found"
        description="Feature not available at the moment, or might have been disabled by the admin"
      />
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon">
          <Link href="/admin/roles">←</Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Edit Role</h1>
          <p className="text-muted-foreground">
            Manage role details and permissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/roles")}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges}>
            {hasChanges && <CheckCircle2 className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RoleSummary
          role={role}
          formData={formData}
          setFormData={setFormData}
          permissionCategories={permissionCategories?.data ?? []}
        />

        <PermissionsForm
          formData={formData}
          setFormData={setFormData}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          permissionCategories={permissionCategories?.data ?? []}
        />
      </div>
    </div>
  )
}
