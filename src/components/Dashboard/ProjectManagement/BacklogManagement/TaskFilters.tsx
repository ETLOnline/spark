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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/src/components/ui/select"
import { Filter } from "lucide-react"
import React, { Dispatch, SetStateAction, useEffect, useState } from "react"
import {
  projectTaskPriority,
  projectTaskTypes
} from "../constants/projectManagment"
import { DynamicIcon, IconName } from "lucide-react/dynamic"
import { GetProjectUsersAction } from "@/src/server-actions/ProjectManagement/projectManagement"
import { SelectTask, SelectTaskStatus, SelectUser } from "@/src/db/schema"
import MultiSelect, {
  MultiSelectOption
} from "@/src/components/ui/multi-select"
import { GetBacklogTasksAction } from "@/src/server-actions/Tasks/Task"
import { useServerAction } from "@/src/hooks/useServerAction"
import { useAtomValue, useSetAtom } from "jotai"
import { projectStore } from "@/src/store/project/projectStore"

interface Props {
  projectId: string
  onApplyFilters: (filters: {
    assignee: string | null | undefined
    priority: string | undefined
    type: string | undefined
    status: string | undefined
  }) => void
}

function TaskFilters({ projectId, onApplyFilters }: Props) {
  const [selectedPriority, setSelectedPriority] = useState<string | undefined>(
    undefined
  )
  const [selectedType, setSelectedType] = useState<string | undefined>(
    undefined
  )
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(
    undefined
  )
  const [selectedAssignee, setSelectedAssignee] = useState<MultiSelectOption[]>(
    []
  )
  const [usersList, setUsersList] = useState<(SelectUser | null)[]>([])
  const statusList = useAtomValue(projectStore.projectStatusList)

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
      selectedAssignee?.[0]?.value === "" ? null : selectedAssignee?.[0]?.value

    onApplyFilters({
      assignee: assigneeValue,
      priority: selectedPriority,
      type: selectedType,
      status: selectedStatus
    })
  }

  async function clearFilters() {
    setSelectedPriority(undefined)
    setSelectedType(undefined)
    setSelectedAssignee([])

    onApplyFilters({
      assignee: undefined,
      priority: undefined,
      type: undefined,
      status: undefined
    })
  }

  const options: MultiSelectOption[] = [
    {
      label: "Unassigned",
      value: ""
    },
    ...usersList.map((user) => ({
      label: (user?.first_name ?? "") + " " + (user?.last_name ?? ""),
      value: user?.unique_id ?? ""
    }))
  ]
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" className="gap-2 bg-transparent">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </DrawerTrigger>
      <DrawerContent>
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
              <Label>Assignee</Label>
              <MultiSelect
                options={options}
                selected={selectedAssignee}
                onChange={(newselected) => {
                  const latestSelected = newselected?.[newselected.length - 1]
                  setSelectedAssignee(latestSelected ? [latestSelected] : [])
                }}
                placeholder="Select Assignee"
              />
            </div>

            {/* Priority Filter */}
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={selectedPriority}
                onValueChange={setSelectedPriority}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {projectTaskPriority.map((priority, index) => (
                    <SelectItem key={index} value={priority.key}>
                      <div className="flex flex-row items-center gap-2">
                        <DynamicIcon
                          name={priority.icon as IconName}
                          className="h-5 w-5"
                          style={{ color: priority.iconColor }}
                        />
                        {priority.title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {projectTaskTypes.map((type, index) => (
                    <SelectItem key={index} value={type.key}>
                      <div className="flex flex-row items-center gap-2">
                        <DynamicIcon
                          name={type.icon as IconName}
                          className="h-5 w-5"
                          style={{ color: type.iconColor }}
                        />
                        {type.title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}

            <div className="space-y-2">
              <Label>Status</Label>
              <Select onValueChange={setSelectedStatus} value={selectedStatus}>
                <SelectTrigger id="status_id" className="col-span-3">
                  <SelectValue placeholder={"Select status"} />
                </SelectTrigger>
                <SelectContent>
                  {statusList?.map(
                    (s) =>
                      s.id && (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      )
                  )}
                </SelectContent>
              </Select>
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
      </DrawerContent>
    </Drawer>
  )
}

export default TaskFilters
