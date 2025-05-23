"use client"

import { DirItem } from "@/src/components/Dashboard/Channels/ChannelDetails/Spaces/types/spaces-types"
import FileDir from "@/src/components/Dashboard/Channels/ChannelDetails/Spaces/FileDir"

export default function FileSharing() {


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


  return (
    <div className="container mx-auto py-8 px-4">
      <FileDir addItemToPath={addItemToPath} findItemByPath={findItemByPath} />
    </div>
  )
}
