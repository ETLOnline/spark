import React, { SetStateAction, useEffect, useState } from "react"
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
import { Textarea } from "../../ui/textarea"
import { Switch } from "../../ui/switch"
import { z } from "zod"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { InsertProject, SelectSpace } from "@/src/db/schema"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { userStore } from "@/src/store/user/userStore"
import { GetSpaceBySlugAction } from "@/src/server-actions/Space/Space"
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

const projectSchema = z.object({
  project_name: z
    .string()
    .min(1, "Title required")
    .max(50, "Title is too long"),
  project_startDate: z
    .string()
    .min(1, "Title required")
    .max(50, "Title is too long"),
  project_targetDate: z
    .string()
    .min(1, "Title required")
    .max(50, "Title is too long"),
  description: z
    .string()
    .min(1, "description required")
    .max(150, "Description is too long"),
  project_type: z.boolean().optional()
})

type ProjectFormData = z.infer<typeof projectSchema>

function ProjectFormModal({
  defaultValues,
  isEditing = false,
  isOpen: externalOpen,
  setIsOpen: setExternalOpen
}: {
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

  const searchParams = useSearchParams()
  const router = useRouter()

  const [channelSlug, setChannelSlug] = useState<string | null>(null)
  const [spaceSlug, setSpaceSlug] = useState<string | null>(null)

  useEffect(() => {
    setChannelSlug(searchParams.get("channel"))
    setSpaceSlug(searchParams.get("space"))
  }, [searchParams])

  useEffect(() => {
    if (!spaceSlug || !channelSlug) return
    GetSpaceBySlugAction(spaceSlug || "", channelSlug || "").then(
      (currentSpace) => {
        if (currentSpace.success && currentSpace.data) {
          setSpace(currentSpace.data)
        }
      }
    )
  }, [spaceSlug, channelSlug])

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
        router.push(`project/${createdProject.data.id}/settings?tab=taskStatus`)
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
    ? permissionChecker?.canAccess("project.create")
    : false
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isEditing && canCreate && (
        <DialogTrigger asChild>
          <Button>Create New Project</Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Update Project" : "Create a New Project"}
          </DialogTitle>
          <DialogDescription>
            Share your innovative idea with the community. Be clear and concise.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(projectSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project_name" className="text-right">
                Title
              </Label>
              <Controller
                name="project_name"
                defaultValue=""
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="project_name"
                    {...field}
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                )}
              />
            </div>
            {/* <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <select
              id="category"
              value={newProposal.category}
              onChange={(e) =>
                setNewProposal({
                  ...newProposal,
                  category: e.target.value,
                })
              }
              className="col-span-3 flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option className='bg-background' value="">Select a category</option>
              {categories.map((category) => (
                <option className='bg-background' key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div> */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project_type" className="text-right">
                Active / Draft
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project_startDate" className="text-right">
                Start Date
              </Label>
              <Controller
                name="project_startDate"
                defaultValue=""
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="project_startDate"
                    {...field}
                    type="date"
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                )}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project_targetDate" className="text-right">
                Target Date
              </Label>
              <Controller
                name="project_targetDate"
                defaultValue=""
                control={form.control}
                render={({ field }) => (
                  <Input
                    id="project_targetDate"
                    {...field}
                    type="date"
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                )}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Controller
                name="description"
                defaultValue=""
                control={form.control}
                render={({ field }) => (
                  <Textarea
                    id="description"
                    {...field}
                    className="col-span-3"
                    rows={5}
                  />
                )}
              />
              {/* <Textarea
                id="description"
                value={newProposal.description}
                onChange={(e) =>
                  setNewProposal({
                    ...newProposal,
                    description: e.target.value,
                  })
                }
                className="col-span-3"
                rows={5}
              /> */}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              loading={createProjectLoading || updateLoading}
            >
              Save Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default ProjectFormModal
