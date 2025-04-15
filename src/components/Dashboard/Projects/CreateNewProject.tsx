import React, { SetStateAction, useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog'
import { Button } from '../../ui/button'
import { Label } from '../../ui/label'
import { Input } from '../../ui/input'
import { Textarea } from '../../ui/textarea'
import { Switch } from "../../ui/switch"
import { z } from 'zod'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { InsertProject, SelectSpace } from '@/src/db/schema'
import { useAtom, useAtomValue } from 'jotai'
import { userStore } from '@/src/store/user/userStore'
import { GetSpaceBySlugAction } from '@/src/server-actions/Space/Space'
import { useServerAction } from '@/src/hooks/useServerAction'
import { CreateProjectAction } from '@/src/server-actions/ProjectManagement/projectManagement'
import { useSearchParams } from 'next/navigation'
import { toast } from '@/src/hooks/use-toast'
import { projectStore } from '@/src/store/project/projectStore'
import moment from 'moment'



const channelSchema = z.object({
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




function CreateNewProject() {

  const [space, setSpace] = useState<SelectSpace>()
  const [isOpen, setIsOpen] = useState(false)
  const [projects, setProjects] = useAtom(projectStore.projects)
  const [createProjectLoading, createProjectData, createProjectError, createProject] = useServerAction(CreateProjectAction)

  const [startDate, setStartDate] = React.useState<Date>()

  const form = useForm({
    resolver: zodResolver(channelSchema)
  })
  const error = form.formState.errors

  const AuthUser = useAtomValue(userStore.AuthUser)

  const searchParams = useSearchParams()

  const channelSlug = searchParams.get("channel")
  const spaceSlug = searchParams.get("space")

  useEffect(() => {
    GetSpaceBySlugAction(spaceSlug || "", channelSlug || "").then((currentSpace) => {
      if (currentSpace.success && currentSpace.data) {
        setSpace(currentSpace.data)
      }
    })
  }, [])

  useEffect(() => {
    form.reset()
  }, [isOpen])

  async function projectSubmit(data: any) {
    if (data.project_type === true) {
      data.project_type = "active"
    }
    else {
      data.project_type = "draft"
    }
    handleCreateProject(data)
  }

  async function handleCreateProject(data: InsertProject) {
    try {
      const payLoad = {
        ...data,
        created_by: AuthUser?.unique_id,
        project_slug: data.project_name,
        space_id: space?.id,
        channel_id: space?.channel_id,
        project_startDate: moment.utc(data.project_startDate).format("DD-MM-YYYY"),
        project_targetDate: moment.utc(data.project_targetDate).format("DD-MM-YYYY"),
      }
      const createdProject = await createProject(payLoad as InsertProject)

      if (createdProject?.success && createdProject?.data) {
        setProjects([...projects, createdProject.data])
        setIsOpen(false)
        toast({
          title: "Project Successfully Created",
          duration: 3000,
        })
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
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open)
    }}>
      <DialogTrigger asChild>
        <Button>Create New Project</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Project</DialogTitle>
          <DialogDescription>
            Share your innovative idea with the community. Be clear and
            concise.
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
                  <Input id="project_name" {...field} className="col-span-3 flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
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
              <Label htmlFor="project_type" className="text-right">Active / Draft</Label>

              <Controller
                name="project_type"
                control={form.control}
                render={({ field }) => (
                  <Switch id="project_type" checked={field.value} onCheckedChange={field.onChange} />
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
                  <Input id="project_startDate" {...field} type="date" className="col-span-3 flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
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
                  <Input id="project_targetDate" {...field} type="date" className="col-span-3 flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
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
                  <Textarea id="description" {...field} className="col-span-3"
                    rows={5} />
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
            <Button type="submit" loading={createProjectLoading}>
              Submit Project
            </Button>
          </DialogFooter>
        </form>

      </DialogContent>
    </Dialog>
  )
}

export default CreateNewProject