import { FolderPlus, Upload, Search } from "lucide-react"
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
  SearchFolderBySlugAction,
  CreateNewFileAction
} from "@/src/server-actions/FileSharing/FileSharing"
import { useParams } from "next/navigation"
import { DirItem } from "./types/spaces-types"
import { formatFileSize, slugify } from "@/src/utils/helpers"
import { useAtom, useAtomValue } from "jotai"
import { spaceStore } from "@/src/store/space/spaceStore"
import { userStore } from "@/src/store/user/userStore"
import { SelectSpaceFileDirectory } from "@/src/db/schema"
import { useToast } from "@/src/hooks/use-toast"
import DirView from "./DirView"
import DirNav from "./DirNav"
import { FileUpload } from "@/src/components/ui/file-upload"
import { useSearchParams } from "next/navigation"
import { getUniqueFileName } from "./utils/helper"
import moment from "moment-timezone"

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
  const authUser = useAtomValue(userStore.AuthUser)

  const [fileData, setFileData] = useState<FileData | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const searchParams = useSearchParams()

  const [createFileLoading, createdFile, createFileError, createNewFile] =
    useServerAction(CreateNewFileAction)

  const newFolderName = useRef<string>("")
  const params = useParams()

  const spaceSlug = params.space_slug as string
  const channelSlug = params.channel_slug as string
  const MAX_FOLDER_DEPTH = 5
  const getCurrentDepth = () => {
    return currentPath.split("/").filter(Boolean).length
  }
  const handleDialogClose = (open: boolean) => {
    setIsNewFolderDialogOpen(open)
    if (!open) {
      setNewFolderError("")
      newFolderName.current = ""
    }
  }

  const isMaxDepthReached = getCurrentDepth() < MAX_FOLDER_DEPTH
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
                updatedAt: moment(item.created_at).format("YYYY-MM-DD"),
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

  const getCurrentFolderItems = () => {
    if (currentPath === "/") return dir
    const folder = findItemByPath(dir, currentPath)
    return folder?.children || []
  }

  const filteredItems = getCurrentFolderItems().filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const createFolder = async () => {
    if (!isMaxDepthReached) {
      setNewFolderError("Maximum folder depth (5 levels) reached")
      return
    }
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
        children: [],
        created_by: authUser?.unique_id
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
    setCurrentPath(path)

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
        toast({
          variant: "destructive",
          description: "Failed to load folder contents",
          duration: 3000
        })
      }
    }
  }

  const processFileForUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
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

  const handleRemoveFile = () => {
    setFileData(null)
  }

  const handleFileUpload = async () => {
    try {
      if (!fileData) return

      const currentFolder =
        currentPath === "/"
          ? dir
          : findItemByPath(dir, currentPath)?.children || []

      const existingNames = currentFolder
        .filter((item) => item.type === "file")
        .map((item) => item.name.toLowerCase())

      const originalName = fileData.fileName

      const uniqueFileName = getUniqueFileName(originalName, existingNames)
      const createdFile = (
        await createNewFile(
          currentPath === "/"
            ? (currSpace?.id as string)
            : (findItemByPath(dir, currentPath)?.id as number),
          uniqueFileName,
          fileData.fileSize,
          fileData.fileB64string,
          fileData.fileType,
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
        description: `File uploaded as "${uniqueFileName}"`,
        duration: 3000
      })
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to upload file",
        duration: 3000
      })
    }
  }
  const handleFolderNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    newFolderName.current = value

    if (value.length === 100) {
      setNewFolderError("Folder name reached 100 characters limit")
    } else {
      setNewFolderError("")
    }
  }

  return (
    <section className="directory w-full flex flex-col gap-4">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 w-full">
        <div className="w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0 hide-scrollbar shrink-0">
          <DirNav navigateToFolder={navigateToFolder} />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch sm:items-center w-full xl:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search in current folder"
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto shrink-0">
            {/* Upload File Drawer */}
            <Drawer
              open={isNewFileDrawerOpen}
              onOpenChange={setIsNewFileDrawerOpen}
            >
              <DrawerTrigger asChild>
                <Button variant="outline" className="flex-1 sm:flex-none">
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="mx-auto w-full max-w-lg">
                  <DrawerTitle></DrawerTitle>
                  <div className="p-4 pb-0">
                    <div className="flex items-center justify-center space-x-2 w-full">
                      <Card className="mb-8 flex flex-col items-center gap-4 pb-8 w-full overflow-hidden">
                        <FileUpload
                          onChange={(files: File[]) => {
                            processFileForUpload({
                              target: { files: [...files] }
                            } as unknown as React.ChangeEvent<HTMLInputElement>)
                          }}
                          onRemove={handleRemoveFile}
                          key={createdFile?.data?.id}
                        />
                        <Button
                          onClick={handleFileUpload}
                          disabled={!fileData || createFileLoading}
                          loading={createFileLoading}
                          className="w-full max-w-[200px]"
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

            {/* Create Folder Dialog */}
            <Dialog
              open={isNewFolderDialogOpen}
              onOpenChange={handleDialogClose}
            >
              <DialogTrigger asChild>
                <Button className="flex-1 sm:flex-none">
                  <FolderPlus className="mr-2 h-4 w-4" />
                  New Folder
                </Button>
              </DialogTrigger>
              <DialogContent
                className="sm:max-w-md w-[95vw] rounded-lg"
                onInteractOutside={(e) => e.preventDefault()}
              >
                <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4">
                  <Input
                    placeholder="Folder name"
                    maxLength={100}
                    onChange={handleFolderNameChange}
                  />
                </div>
                {newFolderError && (
                  <span className="text-red-500 text-sm">{newFolderError}</span>
                )}
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsNewFolderDialogOpen(false)}
                    className="w-full sm:w-auto"
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
                    className="w-full sm:w-auto"
                  >
                    Create
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <Card className="w-full overflow-hidden border">
        {dirContentLoading || spaceLoading ? (
          <div className="w-full p-10 flex justify-center">
            <Loader size={LoaderSizes.xl} />
          </div>
        ) : (
          <DirView
            navigateToFolder={navigateToFolder}
            searchQuery={searchQuery}
          />
        )}
      </Card>
    </section>
  )
}

export default FileDir
