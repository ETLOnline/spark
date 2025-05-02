import { File, Folder, Loader2, Trash2 } from "lucide-react"
import { DirItem } from "./types/spaces-types"
import { useAtomValue, useSetAtom } from "jotai"
import { spaceStore } from "@/src/store/space/spaceStore"
import { userStore } from "@/src/store/user/userStore"
import { deleteFileAction } from "@/src/server-actions/FileSharing/FileSharing"
import { useToast } from "@/src/hooks/use-toast"
import { isUserAdmin } from "@/src/utils/helpers"
import { useState } from "react"
import { useServerAction } from "@/src/hooks/useServerAction"

type DirViewProps = {
  navigateToFolder: (path: string) => Promise<void>
}

const DirView: React.FC<DirViewProps> = ({ navigateToFolder }) => {
  const dir = useAtomValue(spaceStore.dir)
  const currentPath = useAtomValue(spaceStore.currDirPath)
  const authUser = useAtomValue(userStore.AuthUser)
  const isAdmin = authUser ? isUserAdmin(authUser) : false
  const setDir = useSetAtom(spaceStore.dir)

  const { toast } = useToast()

  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [isDeleting, , , deleteFile] = useServerAction(deleteFileAction)

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

  const removeItemFromPath = (
    items: DirItem[],
    path: string,
    idToRemove: number
  ): DirItem[] => {
    if (path === "/") {
      return items.filter((item) => item.id !== idToRemove)
    }

    return items.map((item) => {
      if (item.type === "folder") {
        if (item.path === path) {
          return {
            ...item,
            children: (item.children || []).filter(
              (child) => child.id !== idToRemove
            )
          }
        }
        if (item.children) {
          return {
            ...item,
            children: removeItemFromPath(item.children, path, idToRemove)
          }
        }
      }
      return item
    })
  }

  const handleDelete = async (item: DirItem) => {
    setDeletingId(item.id)

    const result = await deleteFile(item.id, authUser!.unique_id, isAdmin)

    if (result?.success) {
      setDir((prev) => removeItemFromPath(prev, currentPath, item.id))

      toast({
        description: "File deleted successfully",
        duration: 3000
      })
    } else {
      toast({
        variant: "destructive",
        description: result?.error || "Failed to delete file",
        duration: 3000
      })
    }

    setDeletingId(null)
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 font-medium text-sm text-muted-foreground mb-2 px-2">
        <div>Type</div>
        <div>Name</div>
        <div>Size</div>
        <div>Updated</div>
        <div>Delete</div>
      </div>
      <div className="divide-y">
        {getItemsAtCurrPath().length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            This folder is empty
          </div>
        ) : (
          getItemsAtCurrPath().map((item) => (
            <div
              className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 items-center py-3 px-2 hover:bg-muted/50 rounded-md"
              key={item.id}
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
              <div className="text-sm text-muted-foreground">
                {item.updatedAt}
              </div>
              <div className="flex justify-center">
                {deletingId === item.id && isDeleting ? (
                  <Loader2 className="h-5 w-5 text-red-500 animate-spin" />
                ) : (
                  <Trash2
                    className="h-5 w-5 text-red-500 hover:text-red-700 cursor-pointer"
                    onClick={() => handleDelete(item)}
                  />
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
