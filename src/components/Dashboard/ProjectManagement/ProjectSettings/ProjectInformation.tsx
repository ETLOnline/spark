import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Switch } from "@/src/components/ui/switch"
import React from "react"
import { SelectProject } from "@/src/db/schema"
import { projectSchema } from "../../Projects/utils/projectSchema"
import { z } from "zod"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "@/src/hooks/use-toast"
import { UpdateProjectAction } from "@/src/server-actions/ProjectManagement/projectManagement"
import { useServerAction } from "@/src/hooks/useServerAction"
import Tiptap from "@/src/components/common/TiptapRichEditor"
import moment from "moment"

type ProjectFormData = z.infer<typeof projectSchema>

interface Props {
  currProjectData: SelectProject
}

function ProjectInformation({ currProjectData }: Props) {
  const [updateLoading, , , updateProject] =
    useServerAction(UpdateProjectAction)

  const {
    control,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      project_name: currProjectData.project_name || "",
      description: currProjectData.description || "",
      project_type: currProjectData.project_type === "active",
      project_startDate: currProjectData.project_startDate
        ? moment(currProjectData.project_startDate, "DD-MM-YYYY").format(
            "YYYY-MM-DD"
          )
        : "",
      project_targetDate: currProjectData.project_targetDate
        ? moment(currProjectData.project_targetDate, "DD-MM-YYYY").format(
            "YYYY-MM-DD"
          )
        : ""
    }
  })

  // Handle form submission
  const onSubmit = async (data: ProjectFormData) => {
    try {
      // Convert project_type boolean to string ('active' or 'draft')
      const projectType = data.project_type ? "active" : "draft"

      const payload = {
        ...data,
        id: currProjectData?.id,
        project_slug: data.project_name,
        project_type: projectType,
        project_startDate: data.project_startDate
          ? moment(data.project_startDate, "YYYY-MM-DD").format("DD-MM-YYYY")
          : "",
        project_targetDate: data.project_targetDate
          ? moment(data.project_targetDate, "YYYY-MM-DD").format("DD-MM-YYYY")
          : ""
      }

      const updatedProject = await updateProject(payload)

      toast({
        title: "Project Successfully Updated",
        duration: 3000
      })
    } catch (error) {
      toast({
        title: "Failed to update Project",
        duration: 3000,
        variant: "destructive"
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Information</CardTitle>
        <CardDescription>
          Update your project details and settings
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project-name">Project Name</Label>
            <Controller
              name="project_name"
              control={control}
              render={({ field }) => <Input id="project-name" {...field} />}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-description">Description</Label>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Tiptap value={field.value} onChange={field.onChange} />
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="project-visibility">Active / Draft</Label>
            <div className="flex items-center space-x-2">
              <Controller
                name="project_type"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="project-visibility"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <span>
                {currProjectData.project_type === "active" ? "Active" : "Draft"}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="project_startDate">Start Date</Label>
            <Controller
              name="project_startDate"
              control={control}
              render={({ field }) => (
                <Input id="project_startDate" type="date" {...field} disabled />
              )}
            />
            {errors.project_startDate && (
              <span className="text-red-500 text-sm">
                {String(errors.project_startDate.message)}
              </span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="project_targetDate">Target Date</Label>
            <Controller
              name="project_targetDate"
              control={control}
              render={({ field }) => (
                <Input id="project_targetDate" type="date" {...field} />
              )}
            />
            {errors.project_targetDate && (
              <span className="text-red-500 text-sm">
                {String(errors.project_targetDate.message)}
              </span>
            )}
          </div>
          {/* <div className="space-y-2">
          <Label htmlFor="project-category">Category</Label>
          <Select defaultValue="web-development">
            <SelectTrigger id="project-category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="web-development">Web Development</SelectItem>
              <SelectItem value="mobile-app">Mobile App</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="project-status">Status</Label>
          <Select defaultValue="in-progress">
            <SelectTrigger id="project-status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="on-hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="project-visibility">Public Visibility</Label>
            <Switch id="project-visibility" />
          </div>
          <p className="text-sm text-muted-foreground">
            When enabled, this project will be visible to all members of your
            organization.
          </p>
        </div> */}
        </CardContent>
        <CardFooter>
          <Button type="submit" loading={updateLoading}>
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

export default ProjectInformation
