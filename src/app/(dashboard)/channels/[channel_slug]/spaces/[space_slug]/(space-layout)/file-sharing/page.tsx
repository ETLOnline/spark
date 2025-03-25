"use client"

import { useRef, useState } from "react"
import {
  FolderPlus,
  File,
  Folder,
  Download,
  Trash2,
  MoreVertical,
  ChevronLeft,
  Upload
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu"
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

interface FileItem {
  id: string
  name: string
  type: "file" | "folder"
  size?: string
  updatedAt: string
  path: string
  children?: FileItem[]
}

type FileData = {
  fileName: string
  fileSize: number
  fileType: string
  fileB64string: string
}

export default function FileSharingPage() {
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: "1",
      name: "Documents",
      type: "folder",
      updatedAt: "2023-05-15",
      path: "/Documents",
      children: [
        {
          id: "2",
          name: "Project Proposal.pdf",
          type: "file",
          size: "2.4 MB",
          updatedAt: "2023-05-14",
          path: "/Documents/Project Proposal.pdf"
        },
        {
          id: "3",
          name: "Meeting Notes",
          type: "folder",
          updatedAt: "2023-05-10",
          path: "/Documents/Meeting Notes",
          children: [
            {
              id: "4",
              name: "Q1 Review.docx",
              type: "file",
              size: "1.2 MB",
              updatedAt: "2023-05-10",
              path: "/Documents/Meeting Notes/Q1 Review.docx"
            }
          ]
        }
      ]
    },
    {
      id: "5",
      name: "Images",
      type: "folder",
      updatedAt: "2023-05-08",
      path: "/Images",
      children: []
    }
  ])
  const [currentPath, setCurrentPath] = useState<string>("/")
  const [newFolderName, setNewFolderName] = useState<string>("")
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] =
    useState<boolean>(false)
  const [fileData, setFileData] = useState<FileData | null>(null)

  const getCurrentItems = (): FileItem[] => {
    // Get files and folders at the current path
    if (currentPath === "/") {
      return files
    }

    const findItemsByPath = (items: FileItem[], path: string): FileItem[] => {
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

    return findItemsByPath(files, currentPath)
  }

  const navigateToFolder = (path: string) => {
    setCurrentPath(path)
  }

  const navigateUp = () => {
    if (currentPath === "/") return

    const pathParts = currentPath.split("/")
    pathParts.pop()
    const parentPath = pathParts.join("/") || "/"
    setCurrentPath(parentPath)
  }

  const createFolder = () => {
    if (!newFolderName.trim()) return

    const newFolder: FileItem = {
      id: Date.now().toString(),
      name: newFolderName,
      type: "folder",
      updatedAt: new Date().toISOString().split("T")[0],
      path:
        currentPath === "/"
          ? `/${newFolderName}`
          : `${currentPath}/${newFolderName}`,
      children: []
    }

    const addFolderToPath = (
      items: FileItem[],
      path: string,
      newItem: FileItem
    ): FileItem[] => {
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
              children: addFolderToPath(item.children, path, newItem)
            }
          }
        }
        return item
      })
    }

    if (currentPath === "/") {
      setFiles([...files, newFolder])
    } else {
      setFiles(addFolderToPath(files, currentPath, newFolder))
    }

    setNewFolderName("")
    setIsNewFolderDialogOpen(false)
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
    await addFileToDb(
      fileData?.fileName as string,
      fileData?.fileB64string as string,
      process.env.S3_BUCKET_NAME as string,
      fileData?.fileSize as number,
      fileData?.fileType as string,
      "/spaces"
    )
    setFileData(null)
  }

  const deleteItem = (id: string) => {
    const removeItem = (items: FileItem[]): FileItem[] => {
      return items.filter((item) => {
        if (item.id === id) {
          return false
        }
        if (item.type === "folder" && item.children) {
          item.children = removeItem(item.children)
        }
        return true
      })
    }

    setFiles(removeItem(files))
  }

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
          <Button onClick={handleFileUpload} disabled={!fileData}>
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
                {currentPath !== "/" &&
                  currentPath
                    .split("/")
                    .filter(Boolean)
                    .map((segment, index, array) => {
                      // Build the path up to this segment
                      const segmentPath =
                        "/" + array.slice(0, index + 1).join("/")

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
                    })}
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
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsNewFolderDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={createFolder}>Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <Card>
          <div className="p-4">
            <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 font-medium text-sm text-muted-foreground mb-2 px-2">
              <div>Type</div>
              <div>Name</div>
              <div>Size</div>
              <div>Updated</div>
            </div>
            <div className="divide-y">
              {getCurrentItems().length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  This folder is empty
                </div>
              ) : (
                getCurrentItems().map((item) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center py-3 px-2 hover:bg-muted/50 rounded-md"
                  >
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
                        item.type === "folder" && navigateToFolder(item.path)
                      }
                    >
                      {item.name}
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {item.size || "-"}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {item.updatedAt}
                      </span>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {item.type === "file" && (
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => deleteItem(item.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </section>
    </div>
  )
}
