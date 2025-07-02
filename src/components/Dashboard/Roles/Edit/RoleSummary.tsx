import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Separator } from "@/src/components/ui/separator"
import { Users, Shield } from "lucide-react"
import { Badge } from "@/src/components/ui/badge"
import { Dispatch, SetStateAction } from "react"
import { GroupedPermission } from "@/src/utils/helpers"

interface Props {
  role: any
  formData: {
    name: string
    permissions: number[]
  }
  setFormData: Dispatch<SetStateAction<any>>
  permissionCategories: GroupedPermission[]
}

export default function RoleSummary({
  role,
  formData,
  setFormData,
  permissionCategories
}: Props) {
  return (
    <div className="lg:col-span-1 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Role Details</CardTitle>
            {role.isSystem && (
              <Badge variant="secondary" className="text-xs">
                System
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role-name">Role Name</Label>
            <Input
              id="role-name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              disabled={role.isSystem}
            />
          </div>
          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {role.userCount} users assigned
              </span>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Permission Summary</p>
              <div className="text-2xl font-bold text-primary">
                {formData.permissions.length}
              </div>
              <p className="text-xs text-muted-foreground">
                permissions selected
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Categories</p>
              {permissionCategories.map((category) => {
                const categoryPermissionIds = category.permissions.map(
                  (p: any) => p.id
                )
                const selectedCount = categoryPermissionIds.filter(
                  (p: number) => formData.permissions.includes(p)
                ).length
                const percentage = Math.round(
                  (selectedCount / categoryPermissionIds.length) * 100
                )

                return (
                  <div
                    key={category.id}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-muted-foreground">
                      {category.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs">
                        {selectedCount}/{categoryPermissionIds.length}
                      </span>
                      <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
