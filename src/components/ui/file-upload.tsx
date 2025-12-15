import React, { useRef, useState } from "react"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import { useDropzone } from "react-dropzone"
import { cn } from "@/src/lib/utils"
import Image from "next/image"
import { CloudUpload, X, GripVertical } from "lucide-react"
import moment from "moment"
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
}> = ({ onChange, onRemove, accept, multiple = false, fileType = "file" }) => {
  const [files, setFiles] = useState<File[]>([])
  const [items, setItems] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (newFiles: File[]) => {
    // Filter files based on fileType
    let filteredFiles = newFiles
    if (fileType === "image") {
      filteredFiles = newFiles.filter((file) => file.type.startsWith("image/"))
    } else if (fileType === "file") {
      filteredFiles = newFiles.filter((file) => !file.type.startsWith("image/"))
    }

    if (filteredFiles.length === 0) return

    if (multiple) {
      // For multiple files, append to existing files
      const updatedFiles = [...files, ...filteredFiles]
      setFiles(updatedFiles)
      setItems(updatedFiles)
      if (onChange) {
        onChange(updatedFiles)
      }
    } else {
      // For single file, replace existing
      const singleFile = filteredFiles.slice(0, 1)
      setFiles(singleFile)
      setItems(singleFile)
      if (onChange) {
        onChange(singleFile)
      }
    }

    // Reset file input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index)
    setFiles(updatedFiles)
    setItems(updatedFiles)
    if (onChange) onChange(updatedFiles)

    // If we've removed the last file, call onRemove and reset input value
    if (updatedFiles.length === 0) {
      if (fileInputRef.current) fileInputRef.current.value = ""
      if (onRemove) onRemove()
    }
  }

  const handleReorder = (newOrder: File[]) => {
    setItems(newOrder)
    setFiles(newOrder)
    if (onChange) onChange(newOrder)
  }

  const handleClick = (e?: React.MouseEvent) => {
    e?.stopPropagation()
    fileInputRef.current?.click()
  }

  const firstItem = items[0]

  const { getRootProps, isDragActive } = useDropzone({
    multiple: multiple,
    noClick: true,
    onDrop: handleFileChange,
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
            className="relative w-full mt-10 max-w-xl mx-auto"
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
                      <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={cn(
                          "relative overflow-hidden bg-white dark:bg-neutral-900 flex items-center justify-between gap-4 p-4 mt-4 w-full mx-auto rounded-md",
                          "shadow-sm hover:shadow-md transition-shadow"
                        )}
                      >
                        {/* Drag Handle */}
                        <div className="flex-shrink-0 text-neutral-400 cursor-grab active:cursor-grabbing">
                          <GripVertical className="h-5 w-5" />
                        </div>

                        {/* Image Preview */}
                        {file.type.startsWith("image/") && (
                          <div className="flex-shrink-0 rounded-md overflow-hidden">
                            <Image
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="object-cover"
                              height={80}
                              width={80}
                            />
                          </div>
                        )}

                        {/* File Info */}
                        <motion.div layout className="flex-1 min-w-0">
                          <div className="flex flex-col gap-2">
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              layout
                              className="text-sm font-medium text-neutral-700 dark:text-neutral-300 truncate"
                            >
                              {file.name}
                            </motion.p>
                            <div className="flex gap-2 flex-wrap">
                              <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                layout
                                className="px-2 py-1 rounded-md bg-gray-100 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-400"
                              >
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                              </motion.span>
                              <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                layout
                                className="px-2 py-1 rounded-md bg-gray-100 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-400"
                              >
                                {file.type}
                              </motion.span>
                            </div>
                          </div>
                        </motion.div>

                        {/* Remove Button */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e: any) => {
                            e.stopPropagation()
                            removeFile(idx)
                          }}
                          className="flex-shrink-0 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 transition-colors"
                          type="button"
                        >
                          <X className="h-5 w-5" />
                        </motion.button>
                      </motion.div>
                    </Reorder.Item>
                  ))}
                </AnimatePresence>
              </Reorder.Group>
            )}
            {/* file preview (single) */}
            {items.length > 0 && !multiple && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={cn(
                  "relative overflow-hidden bg-red-500 dark:bg-neutral-900 flex items-center justify-between gap-4 p-4 mt-4 w-full mx-auto rounded-md",
                  "shadow-sm hover:shadow-md transition-shadow"
                )}
              >
                {/* File Info */}
                <motion.div
                  layout
                  className={cn(
                    "relative overflow-hidden bg-white dark:bg-neutral-900 flex flex-col items-start justify-start md:h-24 p-4 w-full mx-auto rounded-md",
                    "shadow-sm"
                  )}
                >
                  <div className="flex justify-between w-full items-center gap-4">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="text-base text-neutral-700 dark:text-neutral-300 truncate max-w-xs"
                    >
                      {firstItem?.name}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="rounded-lg px-2 py-1 w-fit flex-shrink-0 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-white shadow-input"
                    >
                      {(firstItem?.size / (1024 * 1024)).toFixed(2)} MB
                    </motion.p>
                  </div>

                  <div className="flex text-sm md:flex-row flex-col items-start md:items-center w-full mt-2 justify-between text-neutral-600 dark:text-neutral-400">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 "
                    >
                      {firstItem?.type}
                    </motion.p>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                    >
                      modified{" "}
                      {moment(firstItem?.lastModified).format("MMM D, YYYY")}
                    </motion.p>
                  </div>
                </motion.div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e: any) => {
                    e.stopPropagation()
                    removeFile(0)
                  }}
                  className="absolute top-10 right-2 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 transition-colors z-10"
                  type="button"
                  aria-label="Remove file"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </motion.div>
            )}
            {items.length > 0 && multiple && fileType === "image" && (
              <motion.button
                onClick={(e: any) => {
                  e.stopPropagation()
                  handleClick(e)
                }}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="
  mt-4 w-full py-2 px-4 rounded-md
  border border-dashed border-primary
  text-primary
  hover:bg-primary/10
  transition-colors
"
              >
                Add More Images
              </motion.button>
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
