import React, { SetStateAction, useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "../../../ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar"
import { Textarea } from "../../../ui/textarea"
import { Button } from "../../../ui/button"
import { ProjectDetails } from "./ProjectDetailVeiw"
import { SelectProject } from "@/src/db/schema"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import Tiptap from "@/src/components/common/Tiptap/TiptapRichEditor"
import { UpdateProjectAction } from "@/src/server-actions/ProjectManagement/projectManagement"
import { toast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"

interface Props {
  selectedProject: SelectProject
}

function ProjectDescriptionDetail({ selectedProject }: Props) {
  const [editdescription, setEditdescription] = useState(false)
  const [content, setContent] = useState("")

  const [editDeatailLoading, , , updateDetails] =
    useServerAction(UpdateProjectAction)

  useEffect(() => {
    if (selectedProject) {
      setContent(selectedProject.description ?? "")
    }
  }, [selectedProject])

  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "PROJECT",
    selectedProject?.id
  )

  const canUpdate = permissionChecker
    ? permissionChecker.canAccess("project.update")
    : false

  async function handleEditDetails() {
    try {
      const res = await updateDetails({
        id: selectedProject.id,
        description: content
      })

      if (res?.success) {
        setEditdescription(false)
        setContent(res.data.description ?? "")
        toast({
          title: "Description updated successfully",
          description: "Your project description has been updated.",
          duration: 3000
        })
      }
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        duration: 3000
      })
    }
  }

  return (
    // For Future Use
    // <Tabs defaultValue="description">
    //   <TabsList className="w-full justify-around">
    //     <TabsTrigger className="w-1/2" value="description">
    //       Description
    //     </TabsTrigger>
    //     <TabsTrigger className="w-1/2" value="updates">
    //       Updates
    //     </TabsTrigger>
    //   </TabsList>
    //   <TabsContent value="description">

    <Card>
      <CardHeader>
        <CardTitle>Project Description</CardTitle>
      </CardHeader>
      <CardContent>
        {editdescription ? (
          <div className="flex flex-col gap-2">
            <Tiptap value={content} onChange={setContent} />

            <Button
              className="float-right"
              onClick={() => handleEditDetails()}
              loading={editDeatailLoading}
            >
              Save
            </Button>
          </div>
        ) : (
          <p
            className={`${canUpdate ? "cursor-pointer" : "cursor-default"}`}
            onClick={() => canUpdate && setEditdescription(true)}
            dangerouslySetInnerHTML={{
              __html: content ?? ""
            }}
          />
        )}
      </CardContent>
    </Card>

    // For Future Use
    //   </TabsContent >
    // <TabsContent value="updates">
    //   <Card>
    //     <CardHeader>
    //       <CardTitle>Project Updates</CardTitle>
    //     </CardHeader>
    //     <CardContent>
    //       {/* <div className="space-y-4">
    //           {selectedProject.updates.map((update) => (
    //             <div key={update.id} className="flex space-x-4">
    //               <Avatar className="h-8 w-8">
    //                 <AvatarImage src={update.author.avatar} alt={update.author.name} />
    //                 <AvatarFallback>{update.author.name[0]}</AvatarFallback>
    //               </Avatar>
    //               <div className="flex-1">
    //                 <p className="text-sm font-medium">{update.author.name}</p>
    //                 <p className="text-sm">{update.content}</p>
    //                 <p className="text-xs text-muted-foreground">{new Date(update.createdAt).toLocaleString()}</p>
    //               </div>
    //             </div>
    //           ))}
    //         </div> */}
    //     </CardContent>
    //     <CardFooter>
    //       {/* <form onSubmit={(e) => { e.preventDefault(); handleAddUpdate(); }} className="w-full">
    //           <Textarea
    //             placeholder="Add a project update..."
    //             value={newUpdate}
    //             onChange={(e) => setNewUpdate(e.target.value)}
    //             className="mb-2"
    //           />
    //           <Button type="submit">Post Update</Button>
    //         </form> */}
    //     </CardFooter>
    //   </Card>
    // </TabsContent>
    // </Tabs >
  )
}

export default ProjectDescriptionDetail
