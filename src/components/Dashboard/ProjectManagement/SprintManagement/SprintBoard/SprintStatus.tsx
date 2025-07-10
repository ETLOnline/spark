import { SelectSprint } from "@/src/db/schema"
import { Clock } from "lucide-react"
import moment from "moment"
import React from "react"

interface Props {
  sprint?: SelectSprint
}

function SprintStatus({ sprint }: Props) {
  const pastDate = moment(sprint?.end_date).isBefore(moment())

  return (
    <div className="text-sm text-muted-foreground">
      <Clock
        className={`inline-block mr-1 h-4 w-4 ${pastDate ? "text-red-500" : "text-muted-foreground"}`}
      />
      {pastDate ? "Sprint is due" : "In Progress"}
    </div>
  )
}

export default SprintStatus
