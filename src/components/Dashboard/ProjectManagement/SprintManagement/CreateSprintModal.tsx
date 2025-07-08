import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { SelectSprint } from "@/src/db/schema"
import { toast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  CreateSprintAction,
  UpdateSprintAction
} from "@/src/server-actions/Sprint/sprint"
import { sprintStore } from "@/src/store/sprint/sprintsStore"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAtom } from "jotai"
import moment from "moment"
import { useParams } from "next/navigation"
import React, { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { z } from "zod"

interface Props {
  isCreateSprintOpen: boolean
  setIsCreateSprintOpen: Dispatch<SetStateAction<boolean>>
  selectedSprint?: SelectSprint | null
}

const projectSchema = z
  .object({
    title: z.string().min(1, "Required").max(50, "Title is too long"),
    start_date: z.string().refine(
      (value) => {
        const inputValue = moment(value)
        const today = moment().startOf("day")
        return inputValue.isSameOrAfter(today)
      },
      {
        message: "Date must not be in the past"
      }
    ),
    end_date: z.string().refine(
      (value) => {
        const inputValue = moment(value)
        const today = moment().startOf("day")
        return inputValue.isSameOrAfter(today)
      },
      {
        message: "End date must not be in the past"
      }
    )
  })
  .refine(
    (data) => {
      const start = moment(data.start_date)

      const end = moment(data.end_date)

      return end.isSameOrAfter(start)
    },
    {
      message: "End date must be after start date",
      path: ["end_date"]
    }
  )

function CreateSprintModal({
  isCreateSprintOpen,
  setIsCreateSprintOpen,
  selectedSprint
}: Props) {
  const [sprints, setSprints] = useAtom(sprintStore.sprints)

  const [createSprintLoading, , , CreateSprint] =
    useServerAction(CreateSprintAction)
  const [updateSprintLoading, , , UpdateSprint] =
    useServerAction(UpdateSprintAction)

  const projectId = useParams().id as string

  const form = useForm({
    resolver: zodResolver(projectSchema)
  })

  const formError = form.formState.errors

  useEffect(() => {
    if (selectedSprint) {
      form.setValue("title", selectedSprint.title)
      form.setValue("start_date", selectedSprint.start_date)
      form.setValue("end_date", selectedSprint.end_date)
    } else {
      form.reset()
    }
  }, [selectedSprint, isCreateSprintOpen])

  function submitData(data: any) {
    if (selectedSprint) {
      handleUpdateSprint(data)
    } else {
      handleCreateSprint(data)
    }
  }

  function handleSprintStatus(sprint: SelectSprint) {
    const start = moment(sprint.start_date).startOf("day")
    const end = moment(sprint.end_date).endOf("day")

    let status
    if (moment().isBefore(moment(start))) {
      status = "upcoming"
    } else if (moment().isAfter(moment(end))) {
      status = "closed"
    } else {
      status = "active"
    }
    return status
  }

  async function handleCreateSprint(data: SelectSprint) {
    try {
      const payload = {
        ...data,
        projectId: projectId,
        sprint_status: handleSprintStatus(data)
      }
      const sprint = await CreateSprint(payload)
      if (sprint?.success && sprint.data) {
        setSprints([...sprints, sprint.data])

        toast({
          title: "sprint successfully created"
        })
        setIsCreateSprintOpen(false)
      }
    } catch {
      toast({
        title: "Unable to create sprint"
      })
    }
  }

  async function handleUpdateSprint(data: SelectSprint) {
    try {
      if (selectedSprint?.id) {
        const finalData = {
          ...data,
          sprint_status: handleSprintStatus(data)
        }
        const UpdatedSprint = await UpdateSprint(selectedSprint.id, finalData)
        if (UpdatedSprint?.success && UpdatedSprint.data) {
          setSprints((prev) =>
            prev.map((s) =>
              s.id === UpdatedSprint.data.id ? UpdatedSprint.data : s
            )
          )

          toast({
            title: "Sprint successfully updated",
            duration: 2000
          })
          setIsCreateSprintOpen(false)
        }
      }
    } catch {
      toast({
        title: "Unable to update sprint",
        duration: 2000
      })
    }
  }

  return (
    <Dialog
      open={isCreateSprintOpen}
      onOpenChange={(open) => setIsCreateSprintOpen(open)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {selectedSprint ? "Edit Sprint" : "Create New Sprint"}
          </DialogTitle>
          <DialogDescription>
            {selectedSprint
              ? "Edit the details of the sprint."
              : "Plan a new sprint for your project."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(submitData)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Name
              </Label>

              <div className="col-span-3">
                <Controller
                  name="title"
                  defaultValue=""
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      id="title"
                      {...field}
                      type="text"
                      className="col-span-3 "
                    />
                  )}
                />
                <div>
                  {formError.title && (
                    <p className="text-sm text-red-500">
                      {formError.title.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start_date" className="text-right">
                Start Date
              </Label>

              <div className="col-span-3">
                <Controller
                  name="start_date"
                  defaultValue=""
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      id="start_date"
                      {...field}
                      className="col-span-3"
                      type="date"
                    />
                  )}
                />
                <div>
                  {formError.start_date && (
                    <p className="text-sm text-red-500">
                      {formError.start_date.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end_date" className="text-right">
                End Date
              </Label>

              <div className="col-span-3">
                <Controller
                  name="end_date"
                  defaultValue=""
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      id="end_date"
                      {...field}
                      className="col-span-3"
                      type="date"
                    />
                  )}
                />

                <div>
                  {formError.end_date && (
                    <p className="text-sm text-red-500">
                      {formError.end_date.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button loading={createSprintLoading || updateSprintLoading}>
              {selectedSprint ? "Save Changes" : "Create Sprint"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateSprintModal
