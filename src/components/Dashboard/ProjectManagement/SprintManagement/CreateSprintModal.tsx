import { UnsavedChangesDialog } from "@/src/components/common/unsavedChangesDialog"
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
import { useConfirmClose } from "@/src/hooks/useConfirmClose"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  CreateSprintAction,
  GetSprintCountAction,
  IsSprintSlugAvailableAction,
  UpdateSprintAction
} from "@/src/server-actions/Sprint/sprint"
import { GetProjectByIdAction } from "@/src/server-actions/ProjectManagement/projectManagement"
import { sprintStore } from "@/src/store/sprint/sprintsStore"
import { zodResolver } from "@hookform/resolvers/zod"
import { useAtom } from "jotai"
import moment from "moment"
import { useParams } from "next/navigation"
import React, { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { set, z } from "zod"
import { SprintStatus } from "../constants/projectManagment"
import { useDebouncedCallback } from "use-debounce"
import { slugify } from "@/src/utils/helpers"
import Loader from "@/src/components/common/Loader/Loader"
import { CircleCheck, CircleXIcon } from "lucide-react"
import { LoaderSizes } from "@/src/components/common/types/loader-types"

interface Props {
  isCreateSprintOpen: boolean
  setIsCreateSprintOpen: Dispatch<SetStateAction<boolean>>
  selectedSprint?: SelectSprint | null
}

const createSprintSchema = (projectDates?: {
  project_startDate?: string
  project_targetDate?: string
}) =>
  z
    .object({
      title: z.string().min(1, "Required").max(50, "Title is too long"),
      slug: z.string().min(1, "Required").max(50, "Slug is too long"),
      start_date: z
        .string()
        .min(1, "Required")
        .refine(
          (value) => {
            if (!value) return true
            const formats = ["YYYY-MM-DD", "DD-MM-YYYY"]
            const projectStart = projectDates?.project_startDate
              ? moment(projectDates.project_startDate, formats, true).startOf(
                  "day"
                )
              : null
            const minStart = projectStart ?? moment().startOf("day")
            return moment(value, "YYYY-MM-DD").isSameOrAfter(minStart)
          },
          { message: "Start date must be on or after project start date " }
        ),
      end_date: z.string().min(1, "Required")
    })
    .refine(
      (data) => {
        if (!data.start_date || !data.end_date) return true
        return moment(data.end_date, "YYYY-MM-DD").isSameOrAfter(
          moment(data.start_date, "YYYY-MM-DD")
        )
      },
      {
        message: "End date must be after start date",
        path: ["end_date"]
      }
    )
    .superRefine((data, ctx) => {
      if (!projectDates?.project_startDate || !projectDates?.project_targetDate)
        return
      const formats = ["YYYY-MM-DD", "DD-MM-YYYY"]
      const projectStart = moment(
        projectDates.project_startDate,
        formats,
        true
      ).startOf("day")
      const projectEnd = moment(
        projectDates.project_targetDate,
        formats,
        true
      ).endOf("day")
      const start = moment(data.start_date, "YYYY-MM-DD")
      const end = moment(data.end_date, "YYYY-MM-DD")
      if (!start.isValid() || !end.isValid()) return
      if (start.isBefore(projectStart)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["start_date"],
          message: `Start date must be on or after project start date`
        })
      }
      if (end.isAfter(projectEnd)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["end_date"],
          message: `End date must be on or before project end date `
        })
      }
    })

function CreateSprintModal({
  isCreateSprintOpen,
  setIsCreateSprintOpen,
  selectedSprint
}: Props) {
  const [sprints, setSprints] = useAtom(sprintStore.sprints)
  const [sprintsCount, setSprintsCount] = useState(0)

  const [createSprintLoading, , , CreateSprint] =
    useServerAction(CreateSprintAction)
  const [updateSprintLoading, , , UpdateSprint] =
    useServerAction(UpdateSprintAction)

  const [slugAvailableMessage, setslugAvailableMessage] = useState("")
  const [isSlugAvailableLoading, , , isSlugAvailable] = useServerAction(
    IsSprintSlugAvailableAction
  )

  const projectId = useParams().id as string

  const [projectDates, setProjectDates] = useState<{
    project_startDate?: string
    project_targetDate?: string
  } | null>(null)

  useEffect(() => {
    if (!projectId || !isCreateSprintOpen) return
    const fetchProjectDates = async () => {
      try {
        const res = await GetProjectByIdAction(projectId)
        if (res?.success && res.data) {
          setProjectDates({
            project_startDate: res.data.project_startDate,
            project_targetDate: res.data.project_targetDate
          })
        }
      } catch (err) {
        toast({
          title: "Unable to fetch project details",
          duration: 3000,
          variant: "destructive"
        })
      }
    }
    fetchProjectDates()
  }, [projectId, isCreateSprintOpen])

  const sprintSchema = React.useMemo(
    () => createSprintSchema(projectDates ?? undefined),
    [projectDates]
  )

  const form = useForm({
    resolver: zodResolver(sprintSchema)
  })

  const formError = form.formState.errors
  const isChanged = form.formState.isDirty

  const GetSprintCount = async (projectId: string) => {
    const sprintsCount = await GetSprintCountAction(projectId)
    if (sprintsCount.data && sprintsCount.success) {
      setSprintsCount(sprintsCount.data)
    }
  }

  useEffect(() => {
    if (!projectId) return
    if (!selectedSprint) {
      GetSprintCount(projectId)
    }
  }, [projectId, isCreateSprintOpen])

  useEffect(() => {
    if (selectedSprint) {
      form.setValue("title", selectedSprint.title)
      form.setValue("start_date", selectedSprint.start_date)
      form.setValue("end_date", selectedSprint.end_date)
    } else if (isCreateSprintOpen && sprintsCount) {
      form.setValue("title", `Sprint ${sprintsCount + 1}`)
      form.setValue("start_date", "")
      form.setValue("end_date", "")
    }
  }, [selectedSprint, isCreateSprintOpen])

  const debouncedCheckSlugAvailability = useDebouncedCallback(
    async (
      slug: string,
      onAvailable?: () => void,
      onNotAvailable?: () => void
    ) => {
      try {
        const result = await isSlugAvailable(slug, projectId)

        if (result && result.data) {
          if (onAvailable) onAvailable()
        } else {
          if (onNotAvailable) onNotAvailable()
        }
      } catch (error) {
        console.error(error)
      }
    },
    1000 // Debounce delay in milliseconds
  )

  useEffect(() => {
    const value = form.getValues("title")?.trim() || ""
    const slug = value.replaceAll(" ", "-").toLowerCase()
    const generatedSlug = slugify(slug)

    if (value && selectedSprint?.slug !== generatedSlug) {
      debouncedCheckSlugAvailability(
        generatedSlug,
        () => {
          form.clearErrors("slug")
          setslugAvailableMessage(`${generatedSlug} is available`)
        },
        () => {
          form.setError("slug", {
            type: "manual",
            message: `${generatedSlug} is already taken`
          })
          setslugAvailableMessage("")
        }
      )
    } else {
      setslugAvailableMessage("")
    }
    form.setValue("slug", generatedSlug)
  }, [form.watch("title")])

  function submitData(data: any) {
    data.title = data.title.trim()
    if (!data.title) {
      form.setError("title", {
        type: "manual",
        message: "Sprint name required"
      })
      return
    }

    if (selectedSprint) {
      handleUpdateSprint(data)
    } else {
      handleCreateSprint(data)
    }
  }

  async function handleCreateSprint(data: SelectSprint) {
    try {
      const payload = {
        ...data,
        projectId: projectId,
        sprint_status: SprintStatus.UPCOMING
      }
      const sprint = await CreateSprint(payload)
      if (sprint?.success && sprint.data) {
        setSprints((prev) => {
          const sprinExists = prev.some((s) => s.id === sprint.data.id)

          return sprinExists ? prev : [...prev, sprint.data]
        })

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
          sprint_status: selectedSprint.sprint_status
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

  const { showConfirmation, setShowConfirmation, handleClose } =
    useConfirmClose({
      isDirty: isChanged,
      onClose: () => setIsCreateSprintOpen(false)
    })

  useEffect(() => {
    if (!isCreateSprintOpen) {
      form.reset()
    }
  }, [isCreateSprintOpen])

  return (
    <>
      <Dialog open={isCreateSprintOpen} onOpenChange={handleClose}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
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
              {/* Title */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Name</Label>

                <div>
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

              {/* Slug */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="slug">Slug</Label>

                <div>
                  <Controller
                    name="slug"
                    defaultValue=""
                    control={form.control}
                    render={({ field }) => (
                      <Input
                        id="slug"
                        {...field}
                        disabled
                        className="col-span-3 "
                      />
                    )}
                  />
                  <div>
                    {formError.slug && !isSlugAvailableLoading && (
                      <div className="flex items-center text-red-500 gap-x-2 pt-1">
                        <CircleXIcon className="h-4 w-4" />
                        <span className="text-sm">
                          {String(formError.slug.message)}
                        </span>
                      </div>
                    )}
                    {isSlugAvailableLoading && (
                      <div className="flex items-center gap-x-2 pt-1">
                        <Loader size={LoaderSizes.sm} />
                        <span className="text-gray-500 text-sm">
                          Checking slug availability
                        </span>
                      </div>
                    )}
                    {slugAvailableMessage && !isSlugAvailableLoading && (
                      <div className="flex items-center gap-x-2 pt-1 text-green-500">
                        <CircleCheck className="h-4 w-4" />
                        <span className="text-sm">{slugAvailableMessage}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Start Date */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="start_date">Start Date</Label>

                <div>
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
                    {formError.start_date ? (
                      <p className="text-sm text-red-500">
                        {formError.start_date.message}
                      </p>
                    ) : (
                      projectDates && (
                        <p className="text-sm text-gray-500 mt-1">
                          Project timeline: {projectDates.project_startDate} —{" "}
                          {projectDates.project_targetDate}
                        </p>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* End Date */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="end_date">End Date</Label>

                <div>
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
                    {formError.end_date ? (
                      <p className="text-sm text-red-500">
                        {formError.end_date.message}
                      </p>
                    ) : (
                      projectDates && (
                        <p className="text-sm text-gray-500 mt-1">
                          Project timeline: {projectDates.project_startDate} —{" "}
                          {projectDates.project_targetDate}
                        </p>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                loading={createSprintLoading || updateSprintLoading}
                disabled={isSlugAvailableLoading}
              >
                {selectedSprint ? "Save Changes" : "Create Sprint"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <UnsavedChangesDialog
        setShowConfirmation={setShowConfirmation}
        showConfirmation={showConfirmation}
        setIsActualDialogOpen={setIsCreateSprintOpen}
      />
    </>
  )
}

export default CreateSprintModal
