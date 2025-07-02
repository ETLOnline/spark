import { Plus } from "lucide-react"
import { Button } from "@/src/components/ui/button"

export function RolesHeader({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold">Roles & Permissions</h1>
        <p className="text-muted-foreground">
          Manage user roles and their permissions across your workspace.
        </p>
      </div>
      <Button onClick={onCreate}>
        <Plus className="mr-2 h-4 w-4" />
        Create Role
      </Button>
    </div>
  )
}
