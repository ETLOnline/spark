import { formatFileSize } from "@/src/utils/helpers"
import { File, Folder } from "lucide-react"
import Link from "next/link"
import { DirItem } from "./types/spaces-types"
import { useAtom, useAtomValue } from "jotai"
import { spaceStore } from "@/src/store/space/spaceStore"
import { GetDirectoryContentsAction } from "@/src/server-actions/FileSharing/FileSharing"
import { useServerAction } from "@/src/hooks/useServerAction"

type DirViewProps = {
  navigateToFolder: (path: string) => Promise<void>
}

const DirView: React.FC<DirViewProps> = ({ navigateToFolder }) => {
  const dir = useAtomValue(spaceStore.dir)
  const currentPath = useAtomValue(spaceStore.currDirPath)

  const [dirContentLoading, dirContent, dirContentError, getDirContent] =
    useServerAction(GetDirectoryContentsAction)

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

  return (
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
                    item.type === "folder" && navigateToFolder(item.path)
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
  )
}

export default DirView
