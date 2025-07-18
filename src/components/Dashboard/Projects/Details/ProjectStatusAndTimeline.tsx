import React from "react"
import { Badge } from "../../../ui/badge"
import { Calendar } from "lucide-react"
import { Progress } from "../../../ui/progress"
import { ProjectDetails } from "./ProjectDetailVeiw"
import { SelectProject } from "@/src/db/schema"

interface Props {
  project: SelectProject
}

function ProjectStatusAndTimeline({ project }: Props) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Project Details</h3>
      <div className="space-y-2">
        <div className="flex items-center">
          <Badge
            variant={
              project.project_type === "active"
                ? "default"
                : project.project_type === "draft"
                  ? "secondary"
                  : "outline"
            }
          >
            {project.project_type}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className=" h-4 w-4" />
          <p className="text-sm">
            Started:
            <span className="text-muted-foreground text-sm">
              {project.project_startDate}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <p className="text-sm">
            Targeted:
            <span className="text-muted-foreground text-sm">
              {project.project_targetDate}
            </span>
          </p>
        </div>
        {/* <div>
          <span className="text-sm font-medium">Progress</span>
          <Progress value={project.progress} className="mt-1" />
        </div> */}
      </div>
    </div>
  )
}

export default ProjectStatusAndTimeline
