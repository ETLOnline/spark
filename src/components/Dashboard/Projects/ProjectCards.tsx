import React, { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "../../ui/card"
import { Badge } from "../../ui/badge"
import { LinkAsButton } from "../../LinkAsButton/LinkAsButton"
import { SelectProject } from "@/src/db/schema"
import { ProjectType } from "../ProjectManagement/types/project.type"
import { Button } from "../../ui/button"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import { Kanban, Users } from "lucide-react"
import { countProjectMembersAction } from "@/src/server-actions/ProjectManagement/projectManagement"

interface Props {
  project: SelectProject
  onEdit: (project: SelectProject) => void
}

function ProjectCards({ project, onEdit }: Props) {
  const [members, setMembers] = useState(0)

  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "PROJECT",
    project?.id
  )

  const canViewLaunchBoard = permissionChecker
    ? permissionChecker.canAccess("project.launch.board")
    : false
  const canUpdate = permissionChecker
    ? permissionChecker.canAccess("project.update")
    : false

  useEffect(() => {
    const countMembers = async () => {
      const res = await countProjectMembersAction(project.id)

      if (res.success && res.data) {
        setMembers(res.data)
      }
    }
    countMembers()
  }, [project])

  return (
    <Card key={project.id} className="mb-4 w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-2">
            {project.project_name}
            <Badge
              variant={
                project.project_type === ProjectType.Active
                  ? "default"
                  : project.project_type === ProjectType.Draft
                    ? "secondary"
                    : "outline"
              }
            >
              {project.project_type}
            </Badge>
          </CardTitle>

          {canUpdate && (
            <Button
              variant={"edit"}
              onClick={() => onEdit(project)}
              className="text-xs"
            >
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <div className="flex flex-col">
          <p className="flex flex-row gap-2 text-muted-foreground text-sm">
            <span>{members}</span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
            </span>
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {canViewLaunchBoard && (
            <LinkAsButton
              href={`/project/${project.id}/board`}
              className="text-xs"
            >
              <Kanban />
              Scrum Board
            </LinkAsButton>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

export default ProjectCards
