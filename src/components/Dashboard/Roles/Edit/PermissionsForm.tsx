import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Badge } from "@/src/components/ui/badge"
import { Checkbox } from "@/src/components/ui/checkbox"
import { Search } from "lucide-react"
import { Dispatch, SetStateAction } from "react"
import { GroupedPermission } from "@/src/utils/helpers"

interface PermissionsFormProps {
  formData: {
    permissions: number[]
  }
  setFormData: Dispatch<SetStateAction<any>>
  searchQuery: string
  setSearchQuery: Dispatch<SetStateAction<string>>
  permissionCategories: GroupedPermission[]
}

export default function PermissionsForm({
  formData,
  setFormData,
  searchQuery,
  setSearchQuery,
  permissionCategories
}: PermissionsFormProps) {
  const filteredCategories = permissionCategories.map((category) => ({
    ...category,
    permissions: category.permissions.filter((permission) =>
      permission.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }))

  const handlePermissionToggle = (permissionId: number) => {
    setFormData((prev: any) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((p: number) => p !== permissionId)
        : [...prev.permissions, permissionId]
    }))
  }

  const handleCategoryToggle = (categoryPermissions: number[]) => {
    const allSelected = categoryPermissions.every((p) =>
      formData.permissions.includes(p)
    )

    if (allSelected) {
      setFormData((prev: any) => ({
        ...prev,
        permissions: prev.permissions.filter(
          (p: number) => !categoryPermissions.includes(p)
        )
      }))
    } else {
      setFormData((prev: any) => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...categoryPermissions])]
      }))
    }
  }

  return (
    <div className="lg:col-span-2">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>
                Select the permissions this role should have
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search permissions..."
                className="pl-8 w-full sm:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {filteredCategories.map((category) => {
              if (category.permissions.length === 0) return null

              const categoryPermissionIds = category.permissions.map(
                (p) => p.id
              )
              const selectedCount = categoryPermissionIds.filter((p) =>
                formData.permissions.includes(p)
              ).length
              const allSelected = selectedCount === categoryPermissionIds.length
              const someSelected =
                selectedCount > 0 &&
                selectedCount < categoryPermissionIds.length

              return (
                <div key={category.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={allSelected}
                        ref={(el) => {
                          if (el instanceof HTMLInputElement) {
                            el.indeterminate = someSelected
                          }
                        }}
                        onCheckedChange={() =>
                          handleCategoryToggle(categoryPermissionIds)
                        }
                      />
                      <div>
                        <Label
                          htmlFor={`category-${category.id}`}
                          className="text-base font-medium cursor-pointer"
                        >
                          {category.name}
                        </Label>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {selectedCount}/{categoryPermissionIds.length}
                    </Badge>
                  </div>

                  <div className="ml-6 grid gap-3">
                    {category.permissions.map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-start space-x-3 p-3 rounded-lg border"
                      >
                        <Checkbox
                          id={`permission-${permission.id}`}
                          checked={formData.permissions.includes(permission.id)}
                          onCheckedChange={() =>
                            handlePermissionToggle(permission.id)
                          }
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={`permission-${permission.id}`}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {permission.name}
                          </Label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            {filteredCategories.every(
              (cat) => cat.permissions.length === 0
            ) && (
              <div className="text-center py-8 text-muted-foreground">
                No permissions found matching your search.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
