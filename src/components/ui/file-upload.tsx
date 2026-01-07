import React, { useRef, useState } from "react"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import { useDropzone } from "react-dropzone"
import { cn } from "@/src/lib/utils"
import { CloudUpload, X } from "lucide-react"
import PreviewItem from "./file-upload/PreviewItem"
import { getFriendlyAcceptLabel, resolveAccept } from "@/src/utils/clientHelper"
import { toast } from "@/src/hooks/use-toast"
import { Button } from "./button"

const mainVariant = {
  initial: {
    x: 0,
    y: 0
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9
  }
}

const secondaryVariant = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1
  }
}

export const FileUpload: React.FC<{
  onChange?: (files: File[]) => void
  onRemove?: () => void
  accept?: string
  multiple?: boolean
  fileType?: "file" | "image"
  showClose?: boolean
  onClose?: () => void
}> = ({
  onChange,
  onRemove,
  accept,
  multiple = false,
  fileType = "file",
  showClose = false,
  onClose
}) => {
  const [files, setFiles] = useState<File[]>([])
  const [items, setItems] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const firstItem = items[0]
  const resolvedAccept = resolveAccept(accept, fileType)

  const handleFileChange = (newFiles: File[]) => {
    if (!newFiles || newFiles.length === 0) return

    let filtered = newFiles
    const acceptIncludesImage = (resolvedAccept || "").includes("image/*")

    if (fileType === "image") {
      // Only allow images
      filtered = newFiles.filter((f) => f.type.startsWith("image/"))
      if (filtered.length === 0) {
        if (fileInputRef.current) fileInputRef.current.value = ""
        toast({
          title: "Invalid file type",
          description: `Only ${getFriendlyAcceptLabel(resolvedAccept, fileType)} are allowed.`
        })
        return
      }
    } else if (fileType === "file") {
      // If the accept string explicitly allows images, let images through too.
      if (acceptIncludesImage) {
        filtered = newFiles
      } else {
        filtered = newFiles.filter((f) => !f.type.startsWith("image/"))
        if (filtered.length === 0) {
          if (fileInputRef.current) fileInputRef.current.value = ""
          toast({
            title: "Invalid file type",
            description: `Images are not allowed. Accepted: ${getFriendlyAcceptLabel(resolvedAccept, fileType)}.`
          })
          return
        }
      }
    }

    if (!multiple) {
      filtered = filtered.slice(0, 1)
    }

    // Update states
    if (
      multiple &&
      (fileType === "image" || (fileType === "file" && acceptIncludesImage))
    ) {
      const next = [...items, ...filtered]
      setItems(next)
      setFiles(next)
      onChange?.(next)
    } else {
      setItems(filtered)
      setFiles(filtered)
      onChange?.(filtered)
    }
  }

  const removeFile = (index: number) => {
    const next = items.filter((_, i) => i !== index)
    setItems(next)
    setFiles(next)
    onChange?.(next)
    if (next.length === 0) {
      if (fileInputRef.current) fileInputRef.current.value = ""
      onRemove?.()
    }
  }

  const handleReorder = (newOrder: File[]) => {
    setItems(newOrder)
    setFiles(newOrder)
    onChange?.(newOrder)
  }

  const handleClick = (e?: any) => {
    e?.stopPropagation()
    fileInputRef.current?.click()
  }

  const { getRootProps, isDragActive } = useDropzone({
    noClick: true,
    multiple,
    accept: resolvedAccept as any,
    onDrop: (acceptedFiles) => handleFileChange(acceptedFiles),
    onDropRejected: (fileRejections) => {
      fileRejections.forEach((fr) =>
        fr.errors.forEach((err) =>
          toast({
            title: "File not accepted",
            description: err.message
          })
        )
      )
    }
  })

  return (
    <div className="w-full " {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="p-10 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden"
      >
        {showClose && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(e: any) => {
              e.stopPropagation()
              e.preventDefault()
              onClose?.()
            }}
            className="absolute top-2 right-2 z-10 "
            aria-label="Close"
          >
            <X className="w-6 h-6 text-red-500" />
            <span className="sr-only">Close</span>
          </Button>
        )}
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
          multiple={multiple}
          accept={resolvedAccept}
        />
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
          <GridPattern />
        </div>
        <div className="flex flex-col items-center justify-center">
          <p className="relative font-sans font-bold text-neutral-700 dark:text-neutral-300 text-base">
            {files.length > 0 ? files[0].name : "Upload file"}
          </p>
          <p className="relative font-sans font-normal text-neutral-400 dark:text-neutral-400 text-base mt-2">
            {files.length > 0
              ? "Click the X to remove or upload a new file"
              : "Drag or drop your files here or click to upload"}
          </p>

          <div
            className="relative w-full  mt-10 max-w-xl mx-auto"
            onClick={(e) => {
              e.stopPropagation()
              // if no items, trigger file picker
              if (items.length === 0) handleClick()
            }}
          >
            {/* image preview  */}
            {items.length > 0 && multiple && fileType === "image" && (
              <Reorder.Group
                axis="y"
                values={items}
                onReorder={handleReorder}
                className="space-y-2"
              >
                <AnimatePresence>
                  {items.map((file, idx) => (
                    <Reorder.Item
                      key={
                        file.lastModified + "-" + file.size + "-" + file.name
                      }
                      value={file}
                      className="cursor-move "
                    >
                      <PreviewItem
                        file={file}
                        index={idx}
                        onRemove={removeFile}
                        showDrag
                      />
                    </Reorder.Item>
                  ))}
                </AnimatePresence>
              </Reorder.Group>
            )}

            {/* file preview (single) */}
            {items.length > 0 && !multiple && (
              <PreviewItem
                file={firstItem}
                index={0}
                onRemove={removeFile}
                isSingle
              />
            )}

            {/* Add more button */}
            {items.length > 0 && multiple && fileType === "image" && (
              <div className="mt-2">
                <PreviewItem showAddMore onAddMore={() => handleClick()} />
              </div>
            )}

            {!items.length && (
              <motion.div
                layoutId="file-upload"
                variants={mainVariant}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }}
                className={cn(
                  "relative group-hover/file:shadow-2xl bg-white dark:bg-neutral-900 flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md",
                  "shadow-[0px_10px_50px_rgba(0,0,0,0.1)] cursor-pointer"
                )}
                onClick={(e: any) => {
                  e.stopPropagation()
                  handleClick(e)
                }}
              >
                {isDragActive ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-neutral-600 flex flex-col items-center"
                  >
                    Drop it
                    <CloudUpload className="h-8 w-8 text-neutral-600 dark:text-neutral-400" />
                  </motion.p>
                ) : (
                  <CloudUpload className="h-8 w-8 text-neutral-600 dark:text-neutral-300" />
                )}
              </motion.div>
            )}

            {!items.length && (
              <motion.div
                variants={secondaryVariant}
                className="absolute opacity-0 border border-dashed border-sky-400 inset-0 bg-transparent flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md"
              ></motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export function GridPattern() {
  const columns = 41
  const rows = 11
  return (
    <div className="flex bg-gray-100 dark:bg-neutral-900 flex-shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px  scale-105">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col
          return (
            <div
              key={`${col}-${row}`}
              className={`w-10 h-10 flex flex-shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-gray-50 dark:bg-neutral-950"
                  : "bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
              }`}
            />
          )
        })
      )}
    </div>
  )
}
