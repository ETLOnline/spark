import { Button } from "@/src/components/ui/button"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/src/components/ui/drawer"
import { Label } from "@/src/components/ui/label"
import { Filter } from "lucide-react"
import React, { useEffect, useState } from "react"
import {
  projectTaskPriority,
  projectTaskTypes
} from "../constants/projectManagment"
import { GetProjectUsersAction } from "@/src/server-actions/ProjectManagement/projectManagement"
import { SelectUser } from "@/src/db/schema"
import MultiSelect, {
  MultiSelectOption
} from "@/src/components/ui/multi-select"
import { GetBacklogTasksAction } from "@/src/server-actions/Tasks/Task"
import { useServerAction } from "@/src/hooks/useServerAction"
import { useAtomValue, useSetAtom } from "jotai"
import { projectStore } from "@/src/store/project/projectStore"
import { TaskFiltersType } from "../types/taskFilters.type"
import { ScrollArea } from "@/src/components/ui/scroll-area"

interface Props {
  projectId: string
  onApplyFilters: (filters: TaskFiltersType) => void
}

function TaskFilters({ projectId, onApplyFilters }: Props) {
  const [selectedPriority, setSelectedPriority] = useState<MultiSelectOption[]>(
    []
  )
  const [selectedType, setSelectedType] = useState<MultiSelectOption[]>([])
  const [selectedStatus, setSelectedStatus] = useState<MultiSelectOption[]>([])
  const [selectedAssignee, setSelectedAssignee] = useState<MultiSelectOption[]>(
    []
  )
  const [usersList, setUsersList] = useState<(SelectUser | null)[]>([])
  const statusList = useAtomValue(projectStore.projectStatusList)
  const [selectedCretors, setSelectedCreators] = useState<MultiSelectOption[]>(
    []
  )

  const [tasksLoading, tasksData, tasksError, GetTasks] = useServerAction(
    GetBacklogTasksAction
  )

  useEffect(() => {
    const fetchProjectUsers = async () => {
      const projectUsersResult = await GetProjectUsersAction(projectId)

      if (projectUsersResult.success && projectUsersResult.data) {
        setUsersList(projectUsersResult.data.map((u) => u.user) ?? [])
      }
    }

    fetchProjectUsers()
  }, [])

  async function applyFilters() {
    const assigneeValue =
      selectedAssignee?.[0]?.value === "" ? null : selectedAssignee

    onApplyFilters({
      assignee: selectedAssignee.map((a) => a.value),
      creator: selectedCretors.map((c) => c.value),
      priority: selectedPriority.map((p) => p.value),
      type: selectedType.map((t) => t.value),
      status: selectedStatus.map((s) => s.value)
    })
  }

  async function clearFilters() {
    setSelectedPriority([])
    setSelectedType([])
    setSelectedAssignee([])
    setSelectedStatus([])

    onApplyFilters({
      assignee: [],
      priority: [],
      type: [],
      status: []
    })
  }

  const CreatorOptions: MultiSelectOption[] = [
    ...usersList.map((user) => ({
      label: (user?.first_name ?? "") + " " + (user?.last_name ?? ""),
      value: user?.unique_id ?? ""
    }))
  ]

  const AssigneeOptions: MultiSelectOption[] = [
    {
      label: "Unassigned",
      value: ""
    },
    ...usersList.map((user) => ({
      label: (user?.first_name ?? "") + " " + (user?.last_name ?? ""),
      value: user?.unique_id ?? ""
    }))
  ]

  const PriorityOptions = projectTaskPriority.map((priority) => ({
    label: priority.title,
    value: priority.key
  }))

  const TypeOptions = projectTaskTypes.map((type) => ({
    label: type.title,
    value: type.key
  }))

  const StatusOptions = statusList.map((status) => ({
    label: status.name,
    value: status.id as string
  }))

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <ScrollArea className="h-screen">
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle>Filter Tasks</DrawerTitle>
              <DrawerDescription>
                Filter tasks by assignee, priority, type, or search by title
              </DrawerDescription>
            </DrawerHeader>

            <div className="p-4 space-y-4">
              {/* Assignee Filter */}
              <div className="space-y-2">
                <Label>Select Assignee</Label>
                <MultiSelect
                  options={AssigneeOptions}
                  selected={selectedAssignee}
                  onChange={setSelectedAssignee}
                  placeholder="Select Assignee"
                />
              </div>

              {/* Creator Filter */}
              <div className="space-y-2">
                <Label>Creator</Label>
                <MultiSelect
                  options={CreatorOptions}
                  selected={selectedCretors}
                  onChange={setSelectedCreators}
                  placeholder="Select Creator"
                />
              </div>

              {/* Priority Filter */}
              <div className="space-y-2">
                <Label>Priority</Label>

                <MultiSelect
                  options={PriorityOptions}
                  selected={selectedPriority}
                  onChange={setSelectedPriority}
                />
              </div>

              {/* Type Filter */}
              <div className="space-y-2">
                <Label>Type</Label>

                <MultiSelect
                  options={TypeOptions}
                  selected={selectedType}
                  onChange={setSelectedType}
                />
              </div>

              {/* Status Filter */}

              <div className="space-y-2">
                <Label>Status</Label>

                <MultiSelect
                  options={StatusOptions}
                  selected={selectedStatus}
                  onChange={setSelectedStatus}
                />
              </div>
            </div>

            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </DrawerClose>

              <DrawerClose asChild>
                <Button onClick={applyFilters}>Apply Filters</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  )
}

export default TaskFilters
