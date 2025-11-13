import { Button } from "@/src/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { useAtom } from "jotai"
import { spaceStore } from "@/src/store/space/spaceStore"
import React from "react"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider
} from "@/src/components/ui/tooltip"

type DirNavProps = {
  navigateToFolder: (path: string) => Promise<void>
}

const DirNav: React.FC<DirNavProps> = ({ navigateToFolder }) => {
  const [currentPath, setCurrentPath] = useAtom(spaceStore.currDirPath)

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

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  // limit width and apply ellipsis
                  className="px-1 h-7 max-w-[200px] truncate text-left"
                  onClick={() => navigateToFolder(segmentPath)}
                >
                  <span className="truncate block">{segment}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">{segment}</TooltipContent>
            </Tooltip>
          </div>
        )
      })

  const navigateUp = () => {
    if (currentPath === "/") return

    const pathParts = currentPath.split("/")
    pathParts.pop()
    const parentPath = pathParts.join("/") || "/"
    setCurrentPath(parentPath)
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <h2 className="text-2xl font-bold mr-2 self-start">Files</h2>
      <div className="flex items-center">
        {currentPath !== "/" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={navigateUp}
            className="mr-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}
        <div className="flex items-center text-sm overflow-hidden whitespace-nowrap">
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
  )
}

export default DirNav
