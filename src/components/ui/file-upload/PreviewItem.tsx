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
          className={`mt-4 w-full py-2 px-4 rounded-md border border-dashed border-primary text-primary hover:bg-primary/10 transition-colors`}
        >
          Add More Images
        </motion.button>
      </div>
    )
  }

  if (!file) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "relative overflow-hidden bg-white dark:bg-neutral-900 flex items-center justify-between gap-2 sm:gap-4 p-3 sm:p-4 mt-4 w-full max-w-full mx-auto rounded-md",
        "shadow-sm hover:shadow-md transition-shadow"
      )}
    >
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
            height={isSingle ? 100 : 80}
            width={isSingle ? 100 : 80}
          />
        </div>
      )}
      {/* file type and name */}
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
          <div className="flex gap-1 flex-wrap w-full overflow-hidden">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              layout
              className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 truncate max-w-[8rem]"
            >
              {file.type}
            </motion.span>
          </div>
        </div>
      </motion.div>
      {/* file date and size */}
      <motion.div className="flex flex-col items-end gap-2 shrink-0">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          layout
          className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-400"
        >
          modified {file ? moment(file.lastModified).format("MMM D, YYYY") : ""}
        </motion.p>
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          layout
          className="px-2 py-1 rounded-md bg-gray-100 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-400"
        >
          {(file.size / (1024 * 1024)).toFixed(2)} MB
        </motion.span>
      </motion.div>
      {/* remove button  */}
      <motion.div>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e: any) => {
            e.stopPropagation()
            onRemove?.(index)
          }}
          className="flex-shrink-0 p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 transition-colors"
          type="button"
          aria-label={`Remove ${file.name}`}
        >
          <X className="h-5 w-5" />
        </motion.button>
      </motion.div>

      {showAddMore && (
        <div className="w-full mt-4">
          <motion.button
            onClick={(e: any) => {
              e.stopPropagation()
              onAddMore?.()
            }}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`mt-4 w-full py-2 px-4 rounded-md border border-dashed border-primary text-primary hover:bg-primary/10 transition-colors`}
          >
            Add More Images
          </motion.button>
        </div>
      )}
    </motion.div>
  )
}

export default PreviewItem
