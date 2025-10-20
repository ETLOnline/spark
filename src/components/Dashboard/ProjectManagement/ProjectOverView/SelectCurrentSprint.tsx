import * as React from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/src/components/ui/select"
import { SelectSprint } from "@/src/db/schema"

interface SelectCurrentSprintProps {
  sprints: SelectSprint[]
  currentSprint: SelectSprint | null
  setCurrentSprint: (sprint: SelectSprint) => void
  setActiveDropdown: (active: boolean) => void
}

export function SelectCurrentSprint({
  sprints,
  currentSprint,
  setCurrentSprint,
  setActiveDropdown
}: SelectCurrentSprintProps) {
  return (
    <Select
      value={currentSprint?.id?.toString() ?? ""}
      onValueChange={(val) => {
        const sprint = sprints.find((s) => s.id.toString() === val)
        if (sprint) {
          setCurrentSprint(sprint)
          setActiveDropdown(false)
        }
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select Sprint" />
      </SelectTrigger>
      <SelectContent>
        {sprints.length > 0 ? (
          sprints.map((sprint) => (
            <SelectGroup key={sprint.id}>
              <SelectItem value={sprint.id.toString()}>
                {sprint.title}
              </SelectItem>
            </SelectGroup>
          ))
        ) : (
          <SelectItem
            value="no-sprint"
            onClick={() => setActiveDropdown(false)}
          >
            No Sprint Found
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  )
}
