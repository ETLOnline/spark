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
          description:
            selectedItem && selectedItem.type === "folder"
              ? "Folder deleted successfully!"
              : "File deleted successfully!",
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

  const selectedItem = getItemsAtCurrPath().find(
    (item) => item.id === selectedFileId
  )
  const selectedFileName = selectedItem?.name || ""

  // Check if any items have actions available
  const hasActions = getItemsAtCurrPath().some(
    (item) =>
      (item.type === "file" || item.type === "folder") && canDeleteFile(item)
  )

  const gridColsClasses = hasActions
    ? "grid-cols-[auto_1fr_auto] md:grid-cols-[auto_1fr_auto_auto_auto]"
    : "grid-cols-[auto_1fr] md:grid-cols-[auto_1fr_auto_auto]"

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

    // Lazy load folder sizes in background without blocking
    const timer = setTimeout(async () => {
      try {
        // Fetch sequentially to avoid overwhelming the server
        for (const folder of foldersToFetch) {
          try {
            const res = await getDirContent(folder.id)
            const totalSize = (res?.data || [])
              .filter((item: any) => item.entity_type === "file")
              .reduce(
                (sum: number, item: any) => sum + (item.file?.file_size ?? 0),
                0
              )
            setFolderSizes((prev) => ({ ...prev, [folder.id]: totalSize }))
          } catch (error) {
            toast({
              variant: "destructive",
              description: `Failed to fetch size for folder "${folder.name}"`,
              duration: 3000
            })
          }
        }
      } catch (error) {
        toast({
          variant: "destructive",
          description: "Failed to fetch folder sizes",
          duration: 3000
        })
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [folderItems, getDirContent, toast])

  return (
    <div className="p-2 md:p-4 w-full overflow-x-auto">
      <div className="min-w-full flex flex-col">
        <div
          className={`grid ${gridColsClasses} gap-2 md:gap-4 font-medium text-sm text-muted-foreground mb-2 px-2`}
        >
          <div>Type</div>
          <div>Name</div>
          <div className="text-center w-20 hidden md:block">Size</div>
          <div className="text-center w-24 hidden md:block">Last Updated</div>
          {hasActions && (
            <div className="text-center w-12 sm:w-16">Actions</div>
          )}
        </div>

        <div className="divide-y w-full">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              {searchQuery
                ? "No matching files or folders"
                : "This folder is empty."}
            </div>
          ) : (
            filteredItems.map((item) => {
              const itemSizeText =
                item.type === "folder"
                  ? folderSizes[item.id] !== undefined
                    ? folderSizes[item.id] > 0
                      ? formatFileSize(folderSizes[item.id])
                      : "-"
                    : "-"
                  : item.size
                    ? item.size
                    : "-"

              return (
                <div
                  key={item.id}
                  className={`grid ${gridColsClasses} gap-2 md:gap-4 items-center py-3 px-2 hover:bg-muted/50 rounded-md w-full`}
                >
                  <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 shrink-0">
                    {item.type === "folder" ? (
                      <Folder className="h-5 w-5 md:h-6 md:w-6 text-blue-500 shrink-0" />
                    ) : (
                      <File className="h-5 w-5 md:h-6 md:w-6 text-gray-500 shrink-0" />
                    )}
                  </div>
                  <div
                    className={`font-medium truncate min-w-0 ${
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
                        className="block truncate"
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <span className="block truncate">{item.name}</span>
                    )}
                    {/* Mobile Size and Date info */}
                    <div className="flex md:hidden text-xs text-muted-foreground mt-1 gap-3">
                      <span>{itemSizeText}</span>
                      <span>{item.updatedAt}</span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground text-center w-20 hidden md:block shrink-0">
                    {itemSizeText}
                  </div>
                  <div className="text-center w-24 hidden md:block shrink-0">
                    <span className="text-sm text-muted-foreground">
                      {item.updatedAt}
                    </span>
                  </div>
                  {hasActions && (
                    <div className="flex items-center justify-center w-12 sm:w-16 shrink-0">
                      {(item.type === "file" ||
                        item.type === "folder" ||
                        authUser?.unique_id === item.created_by) &&
                        canDeleteFile(item) && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                title="Delete"
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 px-0 sm:px-2 text-destructive hover:text-destructive"
                                onClick={() => setSelectedFileId(item.id)}
                              >
                                <Trash className="h-4 w-4 shrink-0" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="w-[95vw] sm:max-w-md rounded-lg">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {selectedItem?.type === "folder"
                                    ? "Delete Folder"
                                    : "Delete File"}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {selectedItem?.type === "folder"
                                    ? `Are you sure you want to delete "${selectedFileName}" and all its children? This action cannot be undone.`
                                    : `Are you sure you want to delete "${selectedFileName}"? This action cannot be undone.`}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
                                <AlertDialogCancel
                                  onClick={() => setSelectedFileId(null)}
                                  className="w-full sm:w-auto"
                                >
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleDeleteConfirm}
                                  className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default DirView
