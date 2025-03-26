"use client"

import { useEffect, useRef, useState } from "react"
import { FolderPlus, File, Folder, ChevronLeft, Upload } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/src/components/ui/dialog"
import { Card } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Button } from "@/src/components/ui/button"
import { Separator } from "@/src/components/ui/separator"
import { FileUpload } from "@/src/components/ui/file-upload"
import { addFileToDb } from "@/src/utils/serverHelpers"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  CreateNewFileAction,
  CreateNewFolderAction
} from "@/src/server-actions/FileSharing/FileSharing"
import { GetSpaceBySlugAction } from "@/src/server-actions/Space/Space"
import { GetDirectoryContentsAction } from "@/src/server-actions/FileSharing/FileSharing"
import { useParams } from "next/navigation"
import { SelectSpaceFileDirectory } from "@/src/db/schema"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/Loader/types/loader-types"
import { useToast } from "@/src/hooks/use-toast"
import { formatFileSize } from "@/src/utils/helpers"
import Link from "next/link"

interface DirItem {
  id: number
  name: string
  type: "file" | "folder"
  size?: string
  updatedAt: string
  path: string
  url?: string
  children?: DirItem[]
}

type FileData = {
  fileName: string
  fileSize: number
  fileType: string
  fileB64string: string
}

export default function FileSharingPage() {
  const [dir, setDir] = useState<DirItem[]>([])
  const [currentPath, setCurrentPath] = useState<string>("/")
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] =
    useState<boolean>(false)
  const [fileData, setFileData] = useState<FileData | null>(null)

  const newFolderName = useRef<string>("")
  const spaceId = useRef<string>("")

  const params = useParams()

  const spaceSlug = params.space_slug as string
  const channelSlug = params.channel_slug as string

  const { toast } = useToast()

  const [
    createFolderLoading,
    createdFolder,
    createFolderError,
    createNewFolder
  ] = useServerAction(CreateNewFolderAction)

  const [createFileLoading, createdFile, createFileError, createNewFile] =
    useServerAction(CreateNewFileAction)

  const [spaceLoading, space, spaceError, getSpaceBySlug] =
    useServerAction(GetSpaceBySlugAction)

  const [dirContentLoading, dirContent, dirContentError, getDirContent] =
    useServerAction(GetDirectoryContentsAction)

  useEffect(() => {
    ;(async () => {
      try {
        const space = await getSpaceBySlug(spaceSlug, channelSlug)
        if (space?.success && space.data) {
          spaceId.current = space.data.id
          try {
            const result = await getDirContent(space.data.id)
            if (result?.success && result.data) {
              const formattedData: DirItem[] = result.data.map((item) => ({
                id: item.id,
                name: item.entity_name,
                type: item.entity_type as "file" | "folder",
                updatedAt: new Date(item.created_at as string)
                  .toISOString()
                  .split("T")[0],
                path: `/${item.entity_name}`,
                size: item.file?.file_size
                  ? formatFileSize(item.file?.file_size)
                  : "",
                url: item.file?.file_path,
                children: []
              }))
              setDir(formattedData)
            }
          } catch (error) {
            console.error("Error fetching directory content:", error)
          }
        }
      } catch (error) {
        console.error("Error fetching space:", error)
      }
    })()
  }, [])

  const findItemByPath = (
    items: DirItem[],
    targetPath: string
  ): DirItem | undefined => {
    for (const item of items) {
      if (item.path === targetPath) {
        return item
      }

      if (item.type === "folder" && item.children) {
        const found = findItemByPath(item.children, targetPath)
        if (found) {
          return found
        }
      }
    }

    return undefined
  }

  const findItemsByPath = (items: DirItem[], path: string): DirItem[] => {
    for (const item of items) {
      if (item.type === "folder") {
        if (item.path === path) {
          return item.children || []
        }

        if (item.children) {
          const found = findItemsByPath(item.children, path)

          if (found.length > 0) {
            return found
          }
        }
      }
    }

    return []
  }

  const getItemsAtCurrPath = (): DirItem[] => {
    if (currentPath === "/") {
      return dir
    }

    return findItemsByPath(dir, currentPath)
  }

  const navigateToFolder = async (path: string) => {
    const selectedFolder = findItemByPath(dir, path)

    if (selectedFolder && selectedFolder.type === "folder") {
      try {
        const result = await getDirContent(selectedFolder.id)

        if (result && result.success && result.data) {
          const childItems: DirItem[] = result.data.map((item) => ({
            id: item.id,
            name: item.entity_name,
            type: item.entity_type as "file" | "folder",
            updatedAt: new Date(item.created_at as string)
              .toISOString()
              .split("T")[0],
            path: `${path}/${item.entity_name}`,
            size: item.file?.file_size
              ? formatFileSize(item.file?.file_size)
              : "",
            url: item.file?.file_path,
            children: []
          }))

          // Update the dir state by adding children to the correct folder
          setDir((prevDir) => {
            const updateChildrenInPath = (items: DirItem[]): DirItem[] => {
              return items.map((item) => {
                if (item.path === path) {
                  return {
                    ...item,
                    children: childItems
                  }
                }
                if (item.children) {
                  return {
                    ...item,
                    children: updateChildrenInPath(item.children)
                  }
                }
                return item
              })
            }

            return updateChildrenInPath(prevDir)
          })
        }
      } catch (error) {
        console.error("Error fetching folder contents:", error)
      }
    }

    setCurrentPath(path)
  }

  const navigateUp = () => {
    if (currentPath === "/") return

    const pathParts = currentPath.split("/")
    pathParts.pop()
    const parentPath = pathParts.join("/") || "/"
    setCurrentPath(parentPath)
  }

  const addItemToPath = (
    items: DirItem[],
    path: string,
    newItem: DirItem
  ): DirItem[] => {
    return items.map((item) => {
      if (item.type === "folder") {
        if (item.path === path) {
          return {
            ...item,
            children: [...(item.children || []), newItem]
          }
        }
        if (item.children) {
          return {
            ...item,
            children: addItemToPath(item.children, path, newItem)
          }
        }
      }
      return item
    })
  }

  const createFolder = async () => {
    try {
      const parentFolderId = findItemByPath(dir, currentPath)?.id
      let createdFolder: SelectSpaceFileDirectory | undefined

      if (!newFolderName.current.trim()) return

      if (currentPath === "/") {
        createdFolder = (
          await createNewFolder(spaceId.current, newFolderName.current)
        )?.data
      } else {
        createdFolder = (
          await createNewFolder(parentFolderId as number, newFolderName.current)
        )?.data
      }

      const newFolder: DirItem = {
        id: createdFolder?.id as number,
        name: newFolderName.current,
        type: "folder",
        updatedAt: new Date(createdFolder?.created_at as string)
          .toISOString()
          .split("T")[0],
        path:
          currentPath === "/"
            ? `/${newFolderName.current}`
            : `${currentPath}/${newFolderName.current}`,
        children: []
      }

      if (currentPath === "/") {
        setDir([...dir, { ...newFolder }])
      } else {
        setDir(addItemToPath(dir, currentPath, newFolder))
      }

      newFolderName.current = ""
      setIsNewFolderDialogOpen(false)
      toast({
        description: "Folder created!",
        duration: 3000
      })
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to create folder",
        duration: 3000
      })
    }
  }

  const processFileForUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Convert file to Base64
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setFileData({
          fileName: file.name,
          fileSize: file.size,
          fileType: file.type,
          fileB64string: base64String
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileUpload = async () => {
    try {
      const uploadedFileData = await addFileToDb(
        fileData?.fileName as string,
        fileData?.fileB64string as string,
        process.env.S3_BUCKET_NAME as string,
        fileData?.fileSize as number,
        fileData?.fileType as string,
        "/spaces"
      )
      const createdFile = (
        await createNewFile(
          currentPath === "/"
            ? spaceId.current
            : (findItemByPath(dir, currentPath)?.id as number),
          fileData?.fileName as string,
          fileData?.fileSize as number,
          uploadedFileData[0].id
        )
      )?.data
      const newFile: DirItem = {
        id: createdFile?.id as number,
        name: createdFile?.entity_name as string,
        type: "file",
        updatedAt: new Date(createdFile?.created_at as string)
          .toISOString()
          .split("T")[0],
        path:
          currentPath === "/"
            ? `/${createdFile?.entity_name as string}`
            : `${currentPath}/${createdFile?.entity_name as string}`,
        size: createdFile?.entity_size
          ? formatFileSize(createdFile?.entity_size)
          : "",
        url: uploadedFileData[0].file_path,
        children: []
      }

      if (currentPath === "/") {
        setDir([...dir, { ...newFile }])
      } else {
        setDir(addItemToPath(dir, currentPath, newFile))
      }

      setFileData(null)

      toast({
        description: "File created!",
        duration: 3000
      })
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to create file",
        duration: 3000
      })
    }
  }

  const filePathBreadCrumbGenerator = () =>
    currentPath
      .split("/")
      .filter(Boolean)
      .map((segment, index, array) => {
        // Build the path up to this segment
        const segmentPath = "/" + array.slice(0, index + 1).join("/")
        return (
          <div key={segmentPath} className="flex items-center">
            <span className="mx-1 text-muted-foreground">/</span>
            <Button
              variant="ghost"
              size="sm"
              className="px-1 h-7"
              onClick={() => navigateToFolder(segmentPath)}
            >
              {segment}
            </Button>
          </div>
        )
      })

  return (
    <div className="container mx-auto py-8 px-4">
      <section className="file-upload">
        <h1 className="text-3xl font-bold mb-8">File Sharing</h1>
        <Card className="mb-8 flex flex-col items-center gap-4 pb-8">
          <FileUpload
            onChange={(files: File[]) => {
              processFileForUpload({
                target: { files: [...files] }
              } as unknown as React.ChangeEvent<HTMLInputElement>)
            }}
          />
          <Button
            onClick={handleFileUpload}
            disabled={!fileData}
            loading={createFileLoading}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </Card>
      </section>
      <Separator className="my-8" />
      <section className="directory">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold mr-2">Files</h2>
            <div className="flex items-center">
              {currentPath !== "/" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={navigateUp}
                  className="mr-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
              )}
              <div className="flex items-center text-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  className="px-1 h-7"
                  onClick={() => navigateToFolder("/")}
                >
                  Root
                </Button>
                {currentPath !== "/" ? filePathBreadCrumbGenerator() : null}
              </div>
            </div>
          </div>
          <Dialog
            open={isNewFolderDialogOpen}
            onOpenChange={setIsNewFolderDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <FolderPlus className="mr-2 h-4 w-4" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  placeholder="Folder name"
                  onChange={(e) => (newFolderName.current = e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsNewFolderDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={createFolder} loading={createFolderLoading}>
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <Card>
          {dirContentLoading || spaceLoading ? (
            <div className="w-full p-10 flex justify-center">
              <Loader size={LoaderSizes.xl} />
            </div>
          ) : (
            <div className="p-4">
              <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 font-medium text-sm text-muted-foreground mb-2 px-2">
                <div>Type</div>
                <div>Name</div>
                <div>Size</div>
                <div>Updated</div>
              </div>
              <div className="divide-y">
                {getItemsAtCurrPath().length === 0 ? (
                  <div className="py-8 text-center text-muted-foreground">
                    This folder is empty
                  </div>
                ) : (
                  getItemsAtCurrPath().map((item) => (
                    <Link href={item.url ?? "#"} key={item.id} scroll={false}>
                      <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center py-3 px-2 hover:bg-muted/50 rounded-md">
                        <div className="flex items-center justify-center w-10 h-10">
                          {item.type === "folder" ? (
                            <Folder className="h-6 w-6 text-blue-500" />
                          ) : (
                            <File className="h-6 w-6 text-gray-500" />
                          )}
                        </div>
                        <div
                          className={`font-medium ${
                            item.type === "folder"
                              ? "cursor-pointer hover:text-primary"
                              : ""
                          }`}
                          onClick={() =>
                            item.type === "folder" &&
                            navigateToFolder(item.path)
                          }
                        >
                          {item.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {item.size || "-"}
                        </div>
                        <div>
                          <span className="text-sm text-muted-foreground">
                            {item.updatedAt}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
        </Card>
      </section>
    </div>
  )
}
