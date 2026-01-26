import { File, Folder, Trash } from "lucide-react"
import Link from "next/link"
import { DirItem } from "./types/spaces-types"
import { useAtom, useAtomValue } from "jotai"
import { spaceStore } from "@/src/store/space/spaceStore"
import { userStore } from "@/src/store/user/userStore"
import { useEffect, useMemo, useState } from "react"
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
import {
  DeleteFileAction,
  GetDirectoryContentsAction
} from "@/src/server-actions/FileSharing/FileSharing"
import { useToast } from "@/src/hooks/use-toast"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import { formatFileSize } from "@/src/utils/helpers"

type DirViewProps = {
  navigateToFolder: (path: string) => Promise<void>
  searchQuery: string
}

const DirView: React.FC<DirViewProps> = ({ navigateToFolder, searchQuery }) => {
  const [dir, setDir] = useAtom(spaceStore.dir)
  const currentPath = useAtomValue(spaceStore.currDirPath)
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null)
  const { toast } = useToast()

  const [deleteFileLoading, , , deleteFile] = useServerAction(DeleteFileAction)
  const [dirContentLoading, dirContent, dirContentError, getDirContent] =
    useServerAction(GetDirectoryContentsAction)
  const currSpace = useAtomValue(spaceStore?.currentSpace)
  const authUser = useAtomValue(userStore.AuthUser)
  const [folderSizes, setFolderSizes] = useState<Record<number, number>>({})

  const getItemsAtCurrPath = (): DirItem[] => {
    if (currentPath === "/") return dir
    return findItemsByPath(dir, currentPath)
  }

  const findItemsByPath = (items: DirItem[], path: string): DirItem[] => {
    for (const item of items) {
      if (item.type === "folder") {
        if (item.path === path) return item.children || []

        if (item.children) {
          const found = findItemsByPath(item.children, path)
          if (found.length > 0) return found
        }
      }
    }
    return []
  }
  const { permissionChecker } = usePermissionChecker(
    "scoped",
    "SPACE",
    currSpace?.id
  )
  const canDeleteSpaceFile = permissionChecker
    ? permissionChecker?.canAccess("space.file_sharing.delete")
    : false

  const canDeleteFile = (item: DirItem): boolean => {
    if (!authUser || !currSpace) return false
    if (canDeleteSpaceFile) return true
    return item.created_by === authUser.unique_id
  }

  const handleDeleteConfirm = async () => {
    if (!selectedFileId || !currSpace || !authUser) return

    try {
      const result = await deleteFile(
        selectedFileId,
        currSpace.id,
        canDeleteSpaceFile
      )

      if (result?.success) {
        const removeFileFromPath = (
          items: DirItem[],
          targetId: number
        ): DirItem[] =>
          items
            .filter((item) => item.id !== targetId)
            .map((item) => ({
              ...item,
              children: item.children
                ? removeFileFromPath(item.children, targetId)
                : undefined
            }))

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

  // Check if any items have actions available
  const hasActions = getItemsAtCurrPath().some(
    (item) => item.type === "file" && canDeleteFile(item)
  )
  const gridCols = hasActions
    ? "grid-cols-[auto_1fr_auto_auto_auto]"
    : "grid-cols-[auto_1fr_auto_auto]"

  const filteredItems = getItemsAtCurrPath().filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const folderItems = useMemo(
    () => filteredItems.filter((item) => item.type === "folder"),
    [filteredItems]
  )

  useEffect(() => {
    const foldersToFetch = folderItems.filter(
      (folder) => folderSizes[folder.id] === undefined
    )

    if (foldersToFetch.length === 0) return

    const fetchAllFolderContents = async () => {
      try {
        const results = await Promise.all(
          foldersToFetch.map((folder) => getDirContent(folder.id))
        )

        const newSizes: Record<number, number> = {}

        results.forEach((res, index) => {
          const folderId = foldersToFetch[index].id

          const totalSize = (res?.data || [])
            .filter((item: any) => item.entity_type === "file")
            .reduce(
              (sum: number, item: any) => sum + (item.file?.file_size ?? 0),
              0
            )

          newSizes[folderId] = totalSize
        })

        setFolderSizes((prev) => ({ ...prev, ...newSizes }))
      } catch (error) {
        toast({
          variant: "destructive",
          description: "Failed to fetch folder sizes",
          duration: 3000
        })
      }
    }

    fetchAllFolderContents()
  }, [folderItems, folderSizes, getDirContent])

  return (
    <div className="p-4">
      <div
        className={`grid ${gridCols} gap-4 font-medium text-sm text-muted-foreground mb-2 px-2`}
      >
        <div>Type</div>
        <div>Name</div>
        <div className="text-center w-20">Size</div>
        <div className="text-center w-24">Last Updated</div>
        {hasActions && <div className="text-center w-16">Actions</div>}
      </div>

      <div className="divide-y">
        {filteredItems.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No matching files or folders
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className={`grid ${gridCols} gap-4 items-center py-3 px-2 hover:bg-muted/50 rounded-md`}
            >
              <div className="flex items-center justify-center w-10 h-10">
                {item.type === "folder" ? (
                  <Folder className="h-6 w-6 text-blue-500" />
                ) : (
                  <File className="h-6 w-6 text-gray-500" />
                )}
              </div>
              <div
                className={`font-medium truncate ${
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
              <div className="text-sm text-muted-foreground text-center w-20">
                {item.type === "folder"
                  ? folderSizes[item.id] !== undefined
                    ? folderSizes[item.id] > 0
                      ? formatFileSize(folderSizes[item.id])
                      : "-" // empty folder
                    : "-"
                  : item.size
                    ? item.size
                    : "-"}
              </div>
              <div className="text-center w-24">
                <span className="text-sm text-muted-foreground">
                  {item.updatedAt}
                </span>
              </div>
              {hasActions && (
                <div className="flex items-center justify-center w-16">
                  {item.type === "file" && canDeleteFile(item) && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          title="Delete"
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-destructive hover:text-destructive"
                          onClick={() => setSelectedFileId(item.id)}
                        >
                          <Trash className="h-4 w-4 mr-1" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete File</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{selectedFileName}
                            "? This action cannot be undone.
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
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default DirView
