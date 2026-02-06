import React, { SetStateAction, use, useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "../../ui/dialog"
import { Button } from "../../ui/button"
import { Label } from "../../ui/label"
import { Input } from "../../ui/input"
import { Switch } from "../../ui/switch"
import { z } from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { InsertProject, SelectSpace } from "@/src/db/schema"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  CreateProjectAction,
  UpdateProjectAction
} from "@/src/server-actions/ProjectManagement/projectManagement"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "@/src/hooks/use-toast"
import { projectStore } from "@/src/store/project/projectStore"
import moment from "moment"
import { AttachProjectUserAction } from "@/src/server-actions/ProjectManagement/projectManagement"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import { useAuthUser } from "@/src/hooks/useAuthUser"
import Tiptap from "@/src/components/common/Tiptap/TiptapRichEditor"
import { projectSchema } from "./utils/projectSchema"
import { useConfirmClose } from "@/src/hooks/useConfirmClose"
import { UnsavedChangesDialog } from "../../common/unsavedChangesDialog"
import { ScrollArea } from "../../ui/scroll-area"

type ProjectFormData = z.infer<typeof projectSchema>

function ProjectFormModal({
  currSpace,
  defaultValues,
  isEditing = false,
  isOpen: externalOpen,
  setIsOpen: setExternalOpen
}: {
  currSpace?: SelectSpace
  defaultValues?: Partial<InsertProject>
  isEditing?: boolean
  isOpen?: boolean
  setIsOpen?: React.Dispatch<SetStateAction<boolean>>
}) {
  const [space, setSpace] = useState<SelectSpace>()
  const { refreshAuthUser, isReloadingPermissions } = useAuthUser()
  const [projects, setProjects] = useAtom(projectStore.projects)
  const [updateLoading, , , updateProject] =
    useServerAction(UpdateProjectAction)

  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen
  const setIsOpen =
    setExternalOpen !== undefined ? setExternalOpen : setInternalOpen
  const [
    createProjectLoading,
    createProjectData,
    createProjectError,
    createProject
  ] = useServerAction(CreateProjectAction)
  const [attachUserLoading, , , AttachUser] = useServerAction(
    AttachProjectUserAction
  )
  const [startDate, setStartDate] = React.useState<Date>()

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      project_name: "",
      description: "",
      project_startDate: "",
      project_targetDate: "",
      project_type: false
    }
  })

  const AuthUser = useAtomValue(userStore.AuthUser)

  const router = useRouter()

  useEffect(() => {
    setSpace(currSpace)
  }, [currSpace])

  useEffect(() => {
    if (!defaultValues) return

    try {
      const formattedStartDate = defaultValues.project_startDate
        ? moment(defaultValues.project_startDate, "DD-MM-YYYY").format(
            "YYYY-MM-DD"
          )
        : ""

      const formattedTargetDate = defaultValues.project_targetDate
        ? moment(defaultValues.project_targetDate, "DD-MM-YYYY").format(
            "YYYY-MM-DD"
          )
        : ""

      form.reset({
        project_name: defaultValues.project_name || "",
        description: defaultValues.description || "",
        project_type: defaultValues.project_type === "active",
        project_startDate: formattedStartDate,
        project_targetDate: formattedTargetDate
      })
    } catch (error) {
      console.error("Error formatting dates:", error)
      form.reset({
        project_name: defaultValues.project_name || "",
        description: defaultValues.description || "",
        project_type: defaultValues.project_type === "active",
        project_startDate: "",
        project_targetDate: ""
      })
    }
  }, [isOpen, defaultValues, form])

  async function projectSubmit(data: ProjectFormData) {
    const projectType = data.project_type === true ? "active" : "draft"

    if (isEditing) {
      handleUpdateProject({ ...data, project_type: projectType })
    } else {
      handleCreateProject({ ...data, project_type: projectType })
    }
  }

  async function handleCreateProject(data: any) {
    try {
      const payLoad = {
        ...data,
        created_by: AuthUser?.unique_id,
        project_slug: data.project_name,
        space_id: space?.id,
        channel_id: space?.channel_id,
        project_startDate: moment
          .utc(data.project_startDate)
          .format("DD-MM-YYYY"),
        project_targetDate: moment
          .utc(data.project_targetDate)
          .format("DD-MM-YYYY")
      }
      const createdProject = await createProject(payLoad as InsertProject)
      if (createdProject?.success && createdProject?.data) {
        await refreshAuthUser()
        if (!AuthUser?.unique_id) {
          toast({
            title: "User ID not found. Please login again.",
            variant: "destructive",
            duration: 3000
          })
          return
        }
        setProjects([...projects, createdProject.data])
        setIsOpen(false)
        toast({
          title: "Project Successfully Created",
          duration: 3000
        })
        router.push(
          `/project/${createdProject.data.id}/settings?tab=taskStatus`
        )
      }
    } catch (error) {
      setIsOpen(false)
      toast({
        title: "Failed to create Project",
        duration: 3000,
        variant: "destructive"
      })
    }
  }

  async function handleUpdateProject(data: any) {
    try {
      const payload = {
        ...data,
        id: defaultValues?.id,
        project_slug: data.project_name,
        space_id: space?.id,
        channel_id: space?.channel_id,
        project_startDate: moment(data.project_startDate).format("DD-MM-YYYY"),
        project_targetDate: moment(data.project_targetDate).format("DD-MM-YYYY")
      }

      if (!payload.id) throw new Error("Missing project ID for update")

      const updatedProject = await updateProject(payload as InsertProject)

      if (updatedProject?.success && updatedProject?.data) {
        const updatedList = projects.map((proj) =>
          proj.id === updatedProject.data.id ? updatedProject.data : proj
        )
        setProjects(updatedList)
        setIsOpen(false)
        toast({
          title: "Project Successfully Updated",
          duration: 3000
        })
      }
    } catch (error) {
      setIsOpen(false)
      toast({
        title: "Failed to update Project",
        duration: 3000,
        variant: "destructive"
      })
    }
  }

  // PERMISSIONS ARE HERE
  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "SPACE",
    space?.id
  )
  const canCreate = permissionChecker
    ? permissionChecker?.canAccess("space.project.create")
    : false

  const isChanged = form.formState.isDirty

  const { showConfirmation, setShowConfirmation, handleClose } =
    useConfirmClose({
      isDirty: isChanged,
      onClose: () => setIsOpen(false)
    })

  const handleDialogChange = (open: boolean) => {
    if (open) {
      setIsOpen(true)
    } else {
      handleClose(false)
    }
  }

  useEffect(() => {
    if (!isOpen) {
      form.reset()
    }
  }, [isOpen])

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleDialogChange}>
        {!isEditing && canCreate && (
          <DialogTrigger asChild>
            <Button>Create New Project</Button>
          </DialogTrigger>
        )}
        <DialogContent
          className=""
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Update Project" : "Create a New Project"}
            </DialogTitle>
            <DialogDescription>
              Share your innovative idea with the community. Be clear and
              concise.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[78vh] w-full pr-3">
            <form onSubmit={form.handleSubmit(projectSubmit)}>
              <div className="grid gap-4 ">
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="flex flex-col gap-2 w-full col-span-4">
                    <Label htmlFor="project_name">Title</Label>
                    <Controller
                      name="project_name"
                      defaultValue=""
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          id="project_name"
                          {...field}
                          className="col-span-3 flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Enter project name"
                        />
                      )}
                    />
                    {form.formState.errors.project_name &&
                      form.formState.submitCount > 0 && (
                        <span className="text-red-500 text-sm">
                          {String(form.formState.errors.project_name.message)}
                        </span>
                      )}
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="flex flex-row w-full col-span-4 items-center">
                    <Label htmlFor="project_type" className="text-right mr-2">
                      Draft / Active
                    </Label>

                    <Controller
                      name="project_type"
                      control={form.control}
                      render={({ field }) => (
                        <Switch
                          id="project_type"
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="flex flex-col gap-2 w-full col-span-4">
                    <Label htmlFor="project_startDate">Start Date</Label>
                    <Controller
                      name="project_startDate"
                      defaultValue=""
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          id="project_startDate"
                          {...field}
                          type="date"
                          min={moment().format("YYYY-MM-DD")}
                          disabled={isEditing}
                          className="col-span-3 flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      )}
                    />
                    {form.formState.errors.project_startDate &&
                      form.formState.submitCount > 0 && (
                        <span className="text-red-500 text-sm">
                          {String(
                            form.formState.errors.project_startDate.message
                          )}
                        </span>
                      )}
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="flex flex-col gap-2 w-full col-span-4">
                    <Label htmlFor="project_targetDate">Target Date</Label>
                    <Controller
                      name="project_targetDate"
                      defaultValue=""
                      control={form.control}
                      render={({ field }) => (
                        <Input
                          id="project_targetDate"
                          {...field}
                          type="date"
                          min={
                            !isEditing
                              ? moment().format("YYYY-MM-DD")
                              : undefined
                          }
                          className="col-span-3 flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      )}
                    />
                    {form.formState.errors.project_targetDate &&
                      form.formState.submitCount > 0 && (
                        <span className="text-red-500 text-sm">
                          {String(
                            form.formState.errors.project_targetDate.message
                          )}
                        </span>
                      )}
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="flex flex-col gap-2  w-full col-span-4">
                    <Label htmlFor="description">Description</Label>
                    <Controller
                      name="description"
                      defaultValue=""
                      control={form.control}
                      render={({ field }) => (
                        <Tiptap value={field.value} onChange={field.onChange} />
                      )}
                    />
                    {form.formState.errors.description &&
                      form.formState.submitCount > 0 && (
                        <span className="text-red-500 text-sm">
                          {String(form.formState.errors.description.message)}
                        </span>
                      )}
                  </div>
                </div>
              </div>
              <DialogFooter className="pt-2">
                <Button
                  type="submit"
                  loading={createProjectLoading || updateLoading}
                >
                  Save Project
                </Button>
              </DialogFooter>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <UnsavedChangesDialog
        showConfirmation={showConfirmation}
        setShowConfirmation={setShowConfirmation}
        setIsActualDialogOpen={setIsOpen}
      />
    </>
  )
}

export default ProjectFormModal
