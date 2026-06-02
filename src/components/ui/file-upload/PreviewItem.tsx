import React from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { GripVertical, X } from "lucide-react"
import { cn } from "@/src/lib/utils"
import moment from "moment"

type Props = {
  file?: File
  index?: number
  onRemove?: (index: number) => void
  showDrag?: boolean
  isSingle?: boolean
  showAddMore?: boolean
  onAddMore?: () => void
}

const PreviewItem: React.FC<Props> = ({
  file,
  index = 0,
  onRemove,
  showDrag = false,
  isSingle = false,
  showAddMore = false,
  onAddMore
}) => {
  if (!file && !showAddMore) return null

  if (showAddMore && !file) {
    return (
      <div className="w-full mt-4">
        <motion.button
          onClick={(e: any) => {
            e.stopPropagation()
            onAddMore?.()
          }}
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-4 w-full py-2 px-4 rounded-md border border-dashed border-primary text-primary hover:bg-primary/10 transition-colors"
        >
          Add More Images
        </motion.button>
      </div>
    )
  }

  if (!file) return null

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-white dark:bg-neutral-900 flex flex-col p-3 mt-4 w-full rounded-md",
        "shadow-sm hover:shadow-md transition-shadow"
      )}
    >
      {/* top row: drag + image + name + remove */}
      <div className="flex items-center gap-3">
        {showDrag && (
          <div className="flex-shrink-0 text-neutral-400 cursor-grab active:cursor-grabbing">
            <GripVertical className="h-5 w-5" />
          </div>
        )}

        {file && file.type.startsWith("image/") && (
          <div className="flex-shrink-0 rounded-md overflow-hidden">
            <Image
              src={URL.createObjectURL(file)}
              alt={file.name}
              className="object-cover"
              height={isSingle ? 100 : 60}
              width={isSingle ? 100 : 60}
            />
          </div>
        )}

        <p className="flex-1 min-w-0 text-sm font-medium text-neutral-700 dark:text-neutral-300">
          {file.name.length > 8 ? file.name.slice(0, 8) + "..." : file.name}
        </p>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e: any) => {
            e.stopPropagation()
            onRemove?.(index)
          }}
          className="flex-shrink-0 p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 transition-colors"
          type="button"
          aria-label={`Remove ${file.name}`}
        >
          <X className="h-4 w-4" />
        </motion.button>
      </div>

      {/* bottom row: type, size, date */}
      <div className="flex flex-wrap gap-1 mt-2">
        <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-neutral-800 text-xs text-neutral-500 dark:text-neutral-400">
          {file.type}
        </span>
        <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-neutral-800 text-xs text-neutral-500 dark:text-neutral-400">
          {(file.size / (1024 * 1024)).toFixed(2)} MB
        </span>
        <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-neutral-800 text-xs text-neutral-500 dark:text-neutral-400">
          {moment(file.lastModified).format("MMM D, YYYY")}
        </span>
      </div>
    </div>
  )
}

export default PreviewItem
