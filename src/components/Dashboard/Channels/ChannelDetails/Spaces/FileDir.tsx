import { FolderPlus, Upload } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/src/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger
} from "@/src/components/ui/drawer"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Card } from "@/src/components/ui/card"
import React, { useEffect, useRef, useState } from "react"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetSpaceBySlugAction } from "@/src/server-actions/Space/Space"
import {
  CreateNewFolderAction,
  GetDirectoryContentsAction,
  SearchFolderBySlugAction
} from "@/src/server-actions/FileSharing/FileSharing"
import { useParams } from "next/navigation"
import { DirItem } from "./types/spaces-types"
import { formatFileSize, slugify } from "@/src/utils/helpers"
import { useAtom, useAtomValue } from "jotai"
import { spaceStore } from "@/src/store/space/spaceStore"
import { SelectSpaceFileDirectory } from "@/src/db/schema"
import { useToast } from "@/src/hooks/use-toast"
import DirView from "./DirView"
import DirNav from "./DirNav"
import { FileUpload } from "@/src/components/ui/file-upload"
import { useSearchParams } from "next/navigation"
import { CreateNewFileAction } from "@/src/server-actions/FileSharing/FileSharing"

type FileData = {
  fileName: string
  fileSize: number
  fileType: string
  fileB64string: string
}

type FileDirProps = {
  addItemToPath: (items: DirItem[], path: string, newItem: DirItem) => DirItem[]
  findItemByPath: (items: DirItem[], targetPath: string) => DirItem | undefined
}

const FileDir: React.FC<FileDirProps> = ({ addItemToPath, findItemByPath }) => {
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] =
    useState<boolean>(false)

  const [isNewFileDrawerOpen, setIsNewFileDrawerOpen] = useState<boolean>(false)
  const [newFolderError, setNewFolderError] = useState<string>("")

  const [dir, setDir] = useAtom(spaceStore.dir)
  const [currentPath, setCurrentPath] = useAtom(spaceStore.currDirPath)
  const [currSpace, setCurrSpace] = useAtom(spaceStore.selectedSpace)

  const [fileData, setFileData] = useState<FileData | null>(null)

  const searchParams = useSearchParams()

  const [createFileLoading, createdFile, createFileError, createNewFile] =
    useServerAction(CreateNewFileAction)

  const newFolderName = useRef<string>("")

  const params = useParams()

  const spaceSlug = params.space_slug as string
  const channelSlug = params.channel_slug as string

  const { toast } = useToast()

  const [spaceLoading, space, spaceError, getSpaceBySlug] =
    useServerAction(GetSpaceBySlugAction)

  const [dirContentLoading, dirContent, dirContentError, getDirContent] =
    useServerAction(GetDirectoryContentsAction)
  const [
    createFolderLoading,
    createdFolder,
    createFolderError,
    createNewFolder
  ] = useServerAction(CreateNewFolderAction)

  const [
    searchFolderLoading,
    searchFolderData,
    searchFolderError,
    searchFolder
  ] = useServerAction(SearchFolderBySlugAction)

  useEffect(() => {
    ;(async () => {
      try {
        const space = await getSpaceBySlug(spaceSlug, channelSlug)
        if (space?.success && space.data) {
          setCurrSpace(space.data)
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
                children: [],
                created_by: item.created_by || undefined
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

  const createFolder = async () => {
    try {
      const parentFolderId = findItemByPath(dir, currentPath)?.id
      const FolderName = newFolderName.current.trim()

      if (!FolderName) return

      const folderSlug = slugify(FolderName)

      const isRoot = currentPath === "/"
      const id = isRoot ? currSpace?.id : parentFolderId

      const existingFolder = await searchFolder(
        id as string | number,
        folderSlug,
        isRoot
      )
      if (existingFolder?.data && existingFolder.data.length > 0) {
        setNewFolderError("Folder already exists")
        return
      }

      let createdFolder: SelectSpaceFileDirectory | undefined
      if (currentPath === "/") {
        createdFolder = (
          await createNewFolder(
            currSpace?.id as string,
            newFolderName.current,
            folderSlug
          )
        )?.data
      } else {
        createdFolder = (
          await createNewFolder(
            parentFolderId as number,
            newFolderName.current,
            folderSlug
          )
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
            children: [],
            created_by: item.created_by || undefined
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
      const createdFile = (
        await createNewFile(
          currentPath === "/"
            ? (currSpace?.id as string)
            : (findItemByPath(dir, currentPath)?.id as number),
          fileData?.fileName as string,
          fileData?.fileSize as number,
          fileData?.fileB64string as string,
          fileData?.fileType as string,
          "spaces"
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
        url: createdFile?.url,
        children: [],
        created_by: createdFile?.created_by || undefined
      }

      if (currentPath === "/") {
        setDir([...dir, { ...newFile }])
      } else {
        setDir(addItemToPath(dir, currentPath, newFile))
      }

      setFileData(null)

      setIsNewFileDrawerOpen(false)

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

  return (
    <section className="directory">
      <div className="flex justify-between items-center mb-4">
        <DirNav navigateToFolder={navigateToFolder} />
        <div className="flex gap-4">
          {/* add new file drawer */}
          <Drawer
            open={isNewFileDrawerOpen}
            onOpenChange={setIsNewFileDrawerOpen}
          >
            <DrawerTrigger asChild>
              <Button variant="outline">
                <FolderPlus className="mr-2 h-4 w-4" />
                Upload File
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="mx-auto w-full max-w-lg">
                <DrawerTitle></DrawerTitle>
                <div className="p-4 pb-0">
                  <div className="flex items-center justify-center space-x-2">
                    <Card className="mb-8 flex flex-col items-center gap-4 pb-8">
                      <FileUpload
                        onChange={(files: File[]) => {
                          processFileForUpload({
                            target: { files: [...files] }
                          } as unknown as React.ChangeEvent<HTMLInputElement>)
                        }}
                        key={createdFile?.data?.id}
                      />
                      <Button
                        onClick={handleFileUpload}
                        disabled={!fileData || createFileLoading}
                        loading={createFileLoading}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </Button>
                    </Card>
                  </div>
                </div>
              </div>
            </DrawerContent>
          </Drawer>

          {/* add new folder dialog */}
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
            <DialogContent onInteractOutside={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <Input
                  placeholder="Folder name"
                  maxLength={100}
                  onChange={(e) => {
                    const value = e.target.value
                    newFolderName.current = value

                    if (value.length === 100) {
                      setNewFolderError(
                        "Folder name reached 100 characters limit"
                      )
                    } else {
                      setNewFolderError("")
                    }
                  }}
                />
              </div>
              {newFolderError && (
                <span className="text-red-500 text-sm">{newFolderError}</span>
              )}
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsNewFolderDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={createFolder}
                  loading={createFolderLoading || searchFolderLoading}
                  disabled={
                    createFolderLoading ||
                    searchFolderLoading ||
                    !!newFolderError
                  }
                >
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <Card>
        {dirContentLoading || spaceLoading ? (
          <div className="w-full p-10 flex justify-center">
            <Loader size={LoaderSizes.xl} />
          </div>
        ) : (
          <DirView navigateToFolder={navigateToFolder} />
        )}
      </Card>
    </section>
  )
}

export default FileDir
