"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import type { LocalMilestone } from "./LocalMilestone"

export function SortableRow({
  item,
  index,
  errorFields,
  isDeleting,
  onChange,
  onDelete
}: {
  item: LocalMilestone
  index: number
  errorFields: { start_date: boolean; end_date: boolean }
  isDeleting?: boolean
  onChange: (id: string, field: keyof LocalMilestone, value: string) => void
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <tr ref={setNodeRef} style={style} className="border-b last:border-0">
      <td className="py-2 pl-2 w-8">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground/50 hover:text-muted-foreground"
        >
          <GripVertical className="h-4 w-4" />
        </div>
      </td>
      <td className="py-2 pr-2 w-8 text-xs text-muted-foreground">
        {index + 1}
      </td>
      <td className="py-2 pr-3">
        <Input
          value={item.name}
          onChange={(e) => onChange(item.id, "name", e.target.value)}
          className="h-8 text-sm"
          placeholder="Milestone name"
        />
      </td>
      <td className="py-2 pr-3 w-44">
        <Input
          type="date"
          value={item.start_date}
          max={item.end_date || undefined}
          onChange={(e) => onChange(item.id, "start_date", e.target.value)}
          className={`h-8 text-sm ${errorFields.start_date ? "border-destructive focus-visible:ring-destructive/40" : ""}`}
        />
      </td>
      <td className="py-2 pr-3 w-44">
        <Input
          type="date"
          value={item.end_date}
          min={item.start_date || undefined}
          onChange={(e) => onChange(item.id, "end_date", e.target.value)}
          className={`h-8 text-sm ${errorFields.end_date ? "border-destructive focus-visible:ring-destructive/40" : ""}`}
        />
      </td>
      <td className="py-2 w-8">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground/50 hover:text-destructive cursor-pointer"
          disabled={isDeleting}
          onClick={() => onDelete(item.id)}
        >
          {isDeleting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </td>
    </tr>
  )
}
