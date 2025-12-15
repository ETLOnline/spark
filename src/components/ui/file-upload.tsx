import React, { useRef, useState } from "react"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import { useDropzone } from "react-dropzone"
import { cn } from "@/src/lib/utils"
import { CloudUpload } from "lucide-react"
import PreviewItem from "./file-upload/PreviewItem"

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
}> = ({ onChange, onRemove, accept, multiple = false, fileType = "file" }) => {
  const [files, setFiles] = useState<File[]>([])
  const [items, setItems] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const firstItem = items[0]

  const handleFileChange = (newFiles: File[]) => {
    // Filter files based on fileType (images only when requested)
    let filtered = newFiles
    if (fileType === "image") {
      filtered = newFiles.filter((f) => f.type.startsWith("image/"))
    }

    if (!multiple) {
      filtered = filtered.slice(0, 1)
    }

    // Update states
    if (multiple && fileType === "image") {
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
    accept: accept as any,
    onDrop: (acceptedFiles) => handleFileChange(acceptedFiles),
    onDropRejected: (error) => {
      console.log(error)
    }
  })

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="p-10 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden"
      >
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden"
          multiple={multiple}
          accept={accept}
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
