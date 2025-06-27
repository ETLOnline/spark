import { File, Folder, Trash } from "lucide-react"
import Link from "next/link"
import { DirItem } from "./types/spaces-types"
import { useAtom, useAtomValue } from "jotai"
import { spaceStore } from "@/src/store/space/spaceStore"
import { userStore } from "@/src/store/user/userStore"
import { isUserSpaceAdmin } from "@/src/utils/spaceRoleHelper"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/src/components/ui/alert-dialog"
import { Button } from "@/src/components/ui/button"
import { useServerAction } from "@/src/hooks/useServerAction"
import { DeleteFileAction } from "@/src/server-actions/FileSharing/FileSharing"
import { useToast } from "@/src/hooks/use-toast"

type DirViewProps = {
  navigateToFolder: (path: string) => Promise<void>
}

const DirView: React.FC<DirViewProps> = ({ navigateToFolder }) => {
  const [dir, setDir] = useAtom(spaceStore.dir)
  const currentPath = useAtomValue(spaceStore.currDirPath)
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null)
  const { toast } = useToast()

  const [deleteFileLoading, , , deleteFile] = useServerAction(DeleteFileAction)

  // Safe atom access with fallbacks
  const currSpace = useAtomValue(spaceStore?.currentSpace)
  const authUser = useAtomValue(userStore.AuthUser)

  const getItemsAtCurrPath = (): DirItem[] => {
    if (currentPath === "/") {
      return dir
    }

    return findItemsByPath(dir, currentPath)
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

  const canDeleteFile = (): boolean => {
    if (!authUser || !currSpace) return false
    try {
      return isUserSpaceAdmin(currSpace.id, authUser)
    } catch {
      return false
    }
  }

  const handleDeleteConfirm = async () => {
    if (!selectedFileId || !currSpace) return

    try {
      const result = await deleteFile(selectedFileId, currSpace.id)

      if (result?.success) {
        // Remove the file from the local state
        const removeFileFromPath = (
          items: DirItem[],
          targetId: number
        ): DirItem[] => {
          return items
            .filter((item) => item.id !== targetId)
            .map((item) => ({
              ...item,
              children: item.children
                ? removeFileFromPath(item.children, targetId)
                : undefined
            }))
        }

        setDir(removeFileFromPath(dir, selectedFileId))

        toast({
          description: "File deleted successfully!",
          duration: 3000
        })
      } else {
        toast({
          variant: "destructive",
          description: result?.error || "Failed to delete file",
          duration: 3000
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        description: "Failed to delete file",
        duration: 3000
      })
    } finally {
      setSelectedFileId(null)
    }
  }

  const selectedFileName =
    getItemsAtCurrPath().find((item) => item.id === selectedFileId)?.name || ""

  return (
    <div className="p-4">
      <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 font-medium text-sm text-muted-foreground mb-2 px-2">
        <div>Type</div>
        <div>Name</div>
        <div>Size</div>
        <div>Updated</div>
        <div>Actions</div>
      </div>
      <div className="divide-y">
        {getItemsAtCurrPath().length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            This folder is empty
          </div>
        ) : (
          getItemsAtCurrPath().map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center py-3 px-2 hover:bg-muted/50 rounded-md"
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
                {item.type === "file" && item.url ? (
                  <Link
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {item.name}
                  </Link>
                ) : (
                  item.name
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {item.size || "-"}
              </div>
              <div>
                <span className="text-sm text-muted-foreground">
                  {item.updatedAt}
                </span>
              </div>
              <div className="flex items-center justify-end">
                {item.type === "file" && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-destructive hover:text-destructive"
                        onClick={() => setSelectedFileId(item.id)}
                      >
                        <Trash className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete File</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{selectedFileName}"?
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel
                          onClick={() => setSelectedFileId(null)}
                        >
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteConfirm}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={deleteFileLoading}
                        >
                          {deleteFileLoading ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default DirView
