"use client"

import { useState } from "react"
import { Card } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Separator } from "@/src/components/ui/separator"
import { FileUpload } from "@/src/components/ui/file-upload"
import { useServerAction } from "@/src/hooks/useServerAction"
import { CreateNewFileAction } from "@/src/server-actions/FileSharing/FileSharing"
import { useToast } from "@/src/hooks/use-toast"
import { formatFileSize } from "@/src/utils/helpers"
import { Upload } from "lucide-react"
import { DirItem } from "@/src/components/Dashboard/Channels/ChannelDetails/Spaces/types/spaces-types"
import { useAtom, useAtomValue } from "jotai"
import { spaceStore } from "@/src/store/space/spaceStore"
import FileDir from "@/src/components/Dashboard/Channels/ChannelDetails/Spaces/FileDir"

type FileData = {
  fileName: string
  fileSize: number
  fileType: string
  fileB64string: string
}

export default function FileSharingPage() {
  const [dir, setDir] = useAtom(spaceStore.dir)
  const currSpace = useAtomValue(spaceStore.selectedSpace)

  const currentPath = useAtomValue(spaceStore.currDirPath)
  const [fileData, setFileData] = useState<FileData | null>(null)

  const { toast } = useToast()

  const [createFileLoading, createdFile, createFileError, createNewFile] =
    useServerAction(CreateNewFileAction)

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
          fileData?.fileType as string
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
        children: []
      }

      if (currentPath === "/") {
        setDir([...dir, { ...newFile }])
      } else {
        setDir(addItemToPath(dir, currentPath, newFile))
      }

      setFileData(null)

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
            key={createdFile?.data?.id}
          />
          <Button
            onClick={handleFileUpload}
            disabled={!fileData}
            loading={createFileLoading}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </Card>
      </section>
      <Separator className="my-8" />
      <FileDir addItemToPath={addItemToPath} findItemByPath={findItemByPath} />
    </div>
  )
}
