"use client"

import Link from "next/link"
import { useEffect, useState, useCallback } from "react"
import { useAtomValue } from "jotai"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  Check,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  GripVertical,
  Info,
  LayoutList,
  Link2,
  Loader2,
  MoreVertical,
  Pencil,
  PlusCircle,
  RotateCcw,
  Trash2,
  X
} from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"
import { Skeleton } from "@/src/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/src/components/ui/dialog"
import { userStore } from "@/src/store/user/userStore"
import { spaceStore } from "@/src/store/space/spaceStore"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  GetMilestonesForSpaceAction,
  SetupMilestonesAction,
  ReconfigureMilestonesAction,
  UpdateMilestoneAction,
  DeleteMilestoneAction,
  RevertMilestoneAction,
  MilestoneInput,
  ReconfigureInput
} from "@/src/server-actions/Milestone/Milestone"
import {
  SelectProjectMilestone,
  MilestoneStatus,
  MilestoneArtifactEntry
} from "@/src/db/schema"
import { useToast } from "@/src/hooks/use-toast"
import moment from "moment"
import { ArtifactManageDialog } from "./ArtifactManageDialog"
import {
  TEMPLATE_MILESTONES,
  CUSTOM_MILESTONE_FEATURES,
  MILESTONE_STATUS_TOAST
} from "./constants"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"

// ─── Types ─────────────────────────────────────────────────────────────────────

type SetupMode = "template" | "custom"
type View = "setup" | "milestones"

interface LocalMilestone {
  id: string // local DnD key — always a fresh UUID
  dbId?: string // original DB milestone id — present for existing milestones during reconfigure
  name: string
  start_date: string
  end_date: string
}

// ─── Status helpers ───────────────────────────────────────────────────────────

function StatusIcon({ status }: { status: string }) {
  if (status === MilestoneStatus.VERIFIED)
    return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
  if (status === MilestoneStatus.COMPLETED_PENDING_VERIFICATION)
    return <Clock className="h-5 w-5 text-amber-500" />
  if (status === MilestoneStatus.IN_PROGRESS)
    return <Clock className="h-5 w-5 text-blue-500" />
  return <Circle className="h-5 w-5 text-muted-foreground/40" />
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    [MilestoneStatus.VERIFIED]: {
      label: "Verified",
      className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20"
    },
    [MilestoneStatus.COMPLETED_PENDING_VERIFICATION]: {
      label: "Completed (Pending Verification)",
      className: "bg-amber-500/10 text-amber-600 border-amber-500/20"
    },
    [MilestoneStatus.IN_PROGRESS]: {
      label: "In Progress",
      className: "bg-blue-500/10 text-blue-600 border-blue-500/20"
    },
    [MilestoneStatus.INCOMPLETE]: {
      label: "Incomplete",
      className: "bg-muted/60 text-muted-foreground border-muted-foreground/20"
    }
  }
  const { label, className } = map[status] ?? map[MilestoneStatus.INCOMPLETE]
  return (
    <Badge variant="outline" className={`text-xs font-medium ${className}`}>
      {label}
    </Badge>
  )
}

// ─── Phase Tracker ────────────────────────────────────────────────────────────

function MilestoneStepper({
  milestones
}: {
  milestones: SelectProjectMilestone[]
}) {
  const completed = milestones.filter(
    (m) => m.status === MilestoneStatus.VERIFIED
  ).length
  const pending = milestones.filter(
    (m) => m.status === MilestoneStatus.COMPLETED_PENDING_VERIFICATION
  ).length
  const inProgress = milestones.filter(
    (m) => m.status === MilestoneStatus.IN_PROGRESS
  ).length
  const total = milestones.length
  const progressPct = total ? Math.round((completed / total) * 100) : 0

  return (
    <div className="rounded-xl border bg-card p-4 mb-6 space-y-4">
      {/* Summary row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" />
            {completed} Completed
          </span>
          {pending > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400 inline-block" />
              {pending} Pending Verification
            </span>
          )}
          {inProgress > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-blue-500 inline-block" />
              {inProgress} In progress
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/30 inline-block" />
            {total - completed - pending - inProgress} Incomplete
          </span>
        </div>
        <span className="text-xs font-medium text-muted-foreground">
          {completed}/{total} complete
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Step nodes */}
      <div className="flex items-start overflow-x-auto pb-1 pt-1">
        {milestones.map((m, i) => {
          const isCompleted = m.status === MilestoneStatus.VERIFIED
          const isPending =
            m.status === MilestoneStatus.COMPLETED_PENDING_VERIFICATION
          const isInProgress = m.status === MilestoneStatus.IN_PROGRESS
          const isLast = i === milestones.length - 1

          // Node ring + fill
          const nodeClass = isCompleted
            ? "border-emerald-500 bg-emerald-500 text-white shadow-sm shadow-emerald-200 dark:shadow-emerald-900"
            : isPending
              ? "border-amber-400 bg-amber-400/10 text-amber-500"
              : isInProgress
                ? "border-blue-500 bg-blue-500/10 text-blue-500"
                : "border-muted-foreground/25 bg-background text-muted-foreground/40"

          // Label colour
          const labelClass = isCompleted
            ? "text-emerald-600 dark:text-emerald-400"
            : isPending
              ? "text-amber-500"
              : isInProgress
                ? "text-blue-500"
                : "text-muted-foreground/60"

          // Status badge text
          const statusText = isCompleted
            ? "Verified"
            : isPending
              ? "Pending Verification"
              : isInProgress
                ? "In Progress"
                : "Not Started"

          // Connector line: solid green only after a completed step
          const lineClass = isCompleted
            ? "bg-emerald-400"
            : "bg-muted-foreground/15"

          // Icon inside circle
          const nodeIcon = isCompleted ? (
            <Check className="h-3.5 w-3.5" />
          ) : isPending ? (
            <Clock className="h-3.5 w-3.5" />
          ) : isInProgress ? (
            <Circle className="h-2.5 w-2.5 fill-current" />
          ) : (
            <span className="text-xs font-semibold">{i + 1}</span>
          )

          return (
            <div key={m.id} className="flex items-start flex-1 min-w-0">
              {/* Node + label */}
              <div className="flex flex-col items-center gap-1.5 min-w-[68px]">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${nodeClass}`}
                >
                  {nodeIcon}
                </div>
                <span
                  className={`text-[11px] text-center leading-tight max-w-[68px] font-medium ${labelClass}`}
                >
                  {m.name}
                </span>
                <span className="text-[10px] text-muted-foreground/50 text-center leading-tight max-w-[68px]">
                  {statusText}
                </span>
              </div>

              {/* Connector line (not after last node) */}
              {!isLast && (
                <div
                  className={`h-0.5 flex-1 mx-1 mt-[15px] rounded-full transition-colors ${lineClass}`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Sortable Row (Setup) ─────────────────────────────────────────────────────

function SortableRow({
  item,
  index,
  errorFields,
  onChange,
  onDelete
}: {
  item: LocalMilestone
  index: number
  errorFields: { start_date: boolean; end_date: boolean }
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
          onChange={(e) => onChange(item.id, "start_date", e.target.value)}
          className={`h-8 text-sm ${errorFields.start_date ? "border-destructive focus-visible:ring-destructive/40" : ""}`}
        />
      </td>
      <td className="py-2 pr-3 w-44">
        <Input
          type="date"
          value={item.end_date}
          onChange={(e) => onChange(item.id, "end_date", e.target.value)}
          className={`h-8 text-sm ${errorFields.end_date ? "border-destructive focus-visible:ring-destructive/40" : ""}`}
        />
      </td>
      <td className="py-2 w-8">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground/50 hover:text-destructive cursor-pointer"
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  )
}

// ─── Setup View ───────────────────────────────────────────────────────────────

function MilestoneSetup({
  spaceId,
  initialMilestones,
  onCancel,
  onComplete
}: {
  spaceId: string
  initialMilestones?: SelectProjectMilestone[]
  onCancel?: () => void
  onComplete: (milestones: SelectProjectMilestone[]) => void
}) {
  const { toast } = useToast()

  const [mode, setMode] = useState<SetupMode>(
    initialMilestones && initialMilestones.length > 0 ? "custom" : "template"
  )
  const [rows, setRows] = useState<LocalMilestone[]>(() => {
    if (initialMilestones && initialMilestones.length > 0) {
      return initialMilestones.map((m) => ({
        id: crypto.randomUUID(),
        dbId: m.id,
        name: m.name,
        start_date: m.start_date ?? "",
        end_date: m.end_date ?? ""
      }))
    }
    return TEMPLATE_MILESTONES.map((name) => ({
      id: crypto.randomUUID(),
      name,
      start_date: "",
      end_date: ""
    }))
  })

  const sensors = useSensors(useSensor(PointerSensor))
  const isReconfigure = !!initialMilestones && initialMilestones.length > 0
  const [isSettingUp, , , setupMilestones] = useServerAction(
    SetupMilestonesAction
  )
  const [isReconfiguring, , , reconfigureMilestones] = useServerAction(
    ReconfigureMilestonesAction
  )
  const isSubmitting = isSettingUp || isReconfiguring
  const [dateErrors, setDateErrors] = useState<
    Record<string, { start_date: boolean; end_date: boolean }>
  >({})

  const handleModeChange = (m: SetupMode) => {
    setMode(m)
    if (m === "template") {
      setRows(
        TEMPLATE_MILESTONES.map((name) => ({
          id: crypto.randomUUID(),
          name,
          start_date: "",
          end_date: ""
        }))
      )
    } else {
      setRows([
        { id: crypto.randomUUID(), name: "", start_date: "", end_date: "" }
      ])
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setRows((prev) => {
        const oldIndex = prev.findIndex((r) => r.id === active.id)
        const newIndex = prev.findIndex((r) => r.id === over.id)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  const handleChange = (
    id: string,
    field: keyof LocalMilestone,
    value: string
  ) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    )
    if (field === "start_date" || field === "end_date") {
      setDateErrors((prev) => {
        if (!prev[id]) return prev
        return { ...prev, [id]: { ...prev[id], [field]: !value } }
      })
    }
  }

  const handleDeleteRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id))
  }

  const handleAdd = () => {
    setRows((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: "", start_date: "", end_date: "" }
    ])
  }

  const handleApply = async () => {
    if (rows.length === 0) {
      toast({ title: "Add at least one milestone", variant: "destructive" })
      return
    }
    if (rows.some((r) => !r.name.trim())) {
      toast({
        title: "All milestone names are required",
        variant: "destructive"
      })
      return
    }

    const errors: Record<string, { start_date: boolean; end_date: boolean }> =
      {}
    rows.forEach((r) => {
      if (!r.start_date || !r.end_date) {
        errors[r.id] = { start_date: !r.start_date, end_date: !r.end_date }
      }
    })
    if (Object.keys(errors).length > 0) {
      setDateErrors(errors)
      toast({
        title: "Start and end dates are required for all milestones",
        variant: "destructive"
      })
      return
    }
    setDateErrors({})

    try {
      if (isReconfigure) {
        // Reconfigure: diff-based — preserves existing IDs and statuses
        const inputs: ReconfigureInput[] = rows.map((r, i) => ({
          id: r.dbId,
          name: r.name.trim(),
          start_date: r.start_date,
          end_date: r.end_date,
          order_index: i
        }))
        const res = await reconfigureMilestones(spaceId, inputs)
        if (res?.success && res.data) {
          toast({ title: "Milestones updated successfully" })
          onComplete(res.data as SelectProjectMilestone[])
        } else {
          toast({
            title: "Failed to update milestones",
            description: (res as { message?: string })?.message,
            variant: "destructive"
          })
        }
      } else {
        // First-time setup: bulk insert
        const inputs: MilestoneInput[] = rows.map((r, i) => ({
          name: r.name.trim(),
          start_date: r.start_date,
          end_date: r.end_date,
          order_index: i
        }))
        const res = await setupMilestones(spaceId, inputs)
        if (res?.success && res.data) {
          toast({ title: "Milestones set up successfully" })
          onComplete(res.data as SelectProjectMilestone[])
        } else {
          toast({
            title: "Failed to set up milestones",
            description: (res as { message?: string })?.message,
            variant: "destructive"
          })
        }
      }
    } catch {
      toast({
        title: isReconfigure
          ? "Failed to update milestones"
          : "Failed to set up milestones",
        variant: "destructive"
      })
    }
  }

  const optionCardClass = (selected: boolean) =>
    `h-auto w-full text-left items-start justify-start rounded-xl border-2 p-4 transition-all cursor-pointer text-foreground hover:text-foreground hover:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 ${
      selected
        ? "border-primary bg-muted/40"
        : "border-muted-foreground/25 hover:border-primary/50 bg-transparent"
    }`

  const radioIndicator = (selected: boolean) => (
    <div
      className={`mt-0.5 h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
        selected ? "border-primary" : "border-muted-foreground/40"
      }`}
    >
      {selected && <div className="h-2 w-2 rounded-full bg-primary" />}
    </div>
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Set Up Project Milestones</h2>
        <p className="text-sm text-muted-foreground">
          Choose how you want to set up milestones for this project.
        </p>
      </div>

      {/* ── Choose Milestone Setup Option ── */}
      <div className="rounded-xl border p-4 space-y-3">
        <div>
          <p className="text-sm font-semibold">Choose Milestone Setup Option</p>
          <p className="text-xs text-muted-foreground">
            Select a template or create a custom set of milestones.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Template card */}
          <Button
            variant="outline"
            onClick={() => handleModeChange("template")}
            className={optionCardClass(mode === "template")}
          >
            <div className="flex items-start gap-3">
              {radioIndicator(mode === "template")}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <LayoutList className="h-4 w-4 text-primary shrink-0" />
                  <p className="font-semibold text-sm">
                    Use FYP Built-in Template
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Apply the standard FYP milestone template.
                </p>
                <p className="text-xs font-medium text-foreground mb-1.5">
                  Template includes:
                </p>
                <ul className="space-y-1">
                  {TEMPLATE_MILESTONES.map((name) => (
                    <li
                      key={name}
                      className="flex items-center gap-1.5 text-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Button>

          {/* Custom card */}
          <Button
            variant="outline"
            onClick={() => handleModeChange("custom")}
            className={optionCardClass(mode === "custom")}
          >
            <div className="flex items-start gap-3">
              {radioIndicator(mode === "custom")}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <Pencil className="h-4 w-4 text-primary shrink-0" />
                  <p className="font-semibold text-sm">
                    Create Custom Milestones
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mb-3">
                  Create a completely custom set of milestones from scratch.
                </p>
                <p className="text-xs font-medium text-foreground mb-1.5">
                  You will be able to:
                </p>
                <ul className="space-y-1">
                  {CUSTOM_MILESTONE_FEATURES.map((t) => (
                    <li
                      key={t}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground"
                    >
                      <div className="h-1 w-1 rounded-full bg-muted-foreground shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Button>
        </div>
      </div>

      {/* Configure table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold">
              Preview & Configure Milestones
            </h3>
            <p className="text-xs text-muted-foreground">
              Adjust names and dates. You can edit them further after applying.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={handleAdd}>
            <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
            Add Milestone
          </Button>
        </div>

        <div className="rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="w-8 py-2 pl-2" />
                <th className="w-8 py-2 text-left text-xs text-muted-foreground font-medium">
                  #
                </th>
                <th className="py-2 pr-3 text-left text-xs text-muted-foreground font-medium">
                  Milestone Name
                </th>
                <th className="py-2 pr-3 w-44 text-left text-xs text-muted-foreground font-medium">
                  Start Date <span className="text-destructive">*</span>
                </th>
                <th className="py-2 pr-3 w-44 text-left text-xs text-muted-foreground font-medium">
                  End Date <span className="text-destructive">*</span>
                </th>
                <th className="w-8 py-2" />
              </tr>
            </thead>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={rows.map((r) => r.id)}
                strategy={verticalListSortingStrategy}
              >
                <tbody>
                  {rows.map((row, i) => (
                    <SortableRow
                      key={row.id}
                      item={row}
                      index={i}
                      errorFields={
                        dateErrors[row.id] ?? {
                          start_date: false,
                          end_date: false
                        }
                      }
                      onChange={handleChange}
                      onDelete={handleDeleteRow}
                    />
                  ))}
                </tbody>
              </SortableContext>
            </DndContext>
          </table>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={!!isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={handleApply}
          disabled={!!isSubmitting}
          className="min-w-36"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : null}
          {mode === "template" ? "Apply Template" : "Apply Custom"} →
        </Button>
      </div>
    </div>
  )
}

// ─── Milestone View ───────────────────────────────────────────────────────────

function MilestoneView({
  milestones: initial,
  canManage,
  canCreateMilestone,
  canUpdateMilestone,
  canDeleteMilestone,
  canVerifyMilestone,
  canRevertMilestone,
  onSetupAgain
}: {
  milestones: SelectProjectMilestone[]
  canManage: boolean
  canCreateMilestone: boolean
  canUpdateMilestone: boolean
  canDeleteMilestone: boolean
  canVerifyMilestone: boolean
  canRevertMilestone: boolean
  onSetupAgain: () => void
}) {
  const { toast } = useToast()
  const [milestones, setMilestones] = useState(initial)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [artifactDialogId, setArtifactDialogId] = useState<string | null>(null)

  const [, , , updateMilestone] = useServerAction(UpdateMilestoneAction)
  const [, , , deleteMilestone] = useServerAction(DeleteMilestoneAction)
  const [, , , revertMilestone] = useServerAction(RevertMilestoneAction)

  const handleStatusChange = async (id: string, status: MilestoneStatus) => {
    setActionLoading(id)
    try {
      const res = await updateMilestone(id, { status })
      if (res?.success) {
        setMilestones((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status } : m))
        )
        toast({ title: MILESTONE_STATUS_TOAST[status] ?? "Status updated." })
      } else {
        toast({ title: "Failed to update status", variant: "destructive" })
      }
    } catch {
      toast({ title: "Failed to update status", variant: "destructive" })
    } finally {
      setActionLoading(null)
    }
  }

  const handleStartEdit = (m: SelectProjectMilestone) => {
    setEditingId(m.id)
    setEditName(m.name)
  }

  const handleSaveName = async (id: string) => {
    if (!editName.trim()) return
    try {
      const res = await updateMilestone(id, { name: editName.trim() })
      if (res?.success) {
        setMilestones((prev) =>
          prev.map((m) => (m.id === id ? { ...m, name: editName.trim() } : m))
        )
      } else {
        toast({ title: "Failed to update name", variant: "destructive" })
      }
    } catch {
      toast({ title: "Failed to update name", variant: "destructive" })
    } finally {
      setEditingId(null)
    }
  }

  // Merges a partial update into the milestone matching `id` in local state
  const updateDialogMilestone = (
    id: string,
    patch: Partial<SelectProjectMilestone>
  ) =>
    setMilestones((prev) =>
      prev.map((milestone) =>
        milestone.id === id ? { ...milestone, ...patch } : milestone
      )
    )

  const handleDelete = async (id: string) => {
    try {
      const res = await deleteMilestone(id)
      if (res?.success) {
        const remaining = milestones.filter((m) => m.id !== id)
        setMilestones(remaining)
        toast({ title: "Milestone deleted" })
        if (remaining.length === 0 && canManage) {
          onSetupAgain()
        }
      } else {
        toast({ title: "Failed to delete", variant: "destructive" })
      }
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" })
    }
  }

  const handleRevert = async (id: string, currentStatus: string) => {
    setActionLoading(id)
    try {
      const res = await revertMilestone(id)
      if (res?.success && res.data) {
        const reverted = res.data as SelectProjectMilestone
        setMilestones((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status: reverted.status } : m))
        )
        toast({ title: "Milestone status reverted." })
      } else {
        toast({
          title: (res as { message?: string })?.message ?? "Failed to revert",
          variant: "destructive"
        })
      }
    } catch {
      toast({ title: "Failed to revert milestone", variant: "destructive" })
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (d: string | null | undefined) =>
    d && moment(d).isValid() ? moment(d).format("DD MMM YYYY") : "—"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Project Milestones</h2>
          <p className="text-xs text-muted-foreground">
            Track progress across each phase of the FYP.
          </p>
        </div>
        {canCreateMilestone && (
          <Button size="sm" variant="outline" onClick={onSetupAgain}>
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Reconfigure
          </Button>
        )}
      </div>

      <MilestoneStepper milestones={milestones} />

      {!canManage &&
        milestones.some((m) => m.status === MilestoneStatus.VERIFIED) && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-600 dark:text-amber-400 -mt-3">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <p>
              Verified milestones are locked. To remove or replace an artifact,
              contact your <span className="font-semibold">Advisor</span> or{" "}
              <span className="font-semibold">University Admin</span>.
            </p>
          </div>
        )}

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="py-2.5 px-4 text-left text-xs text-muted-foreground font-medium">
                Milestone Name
              </th>
              <th className="py-2.5 px-4 text-left text-xs text-muted-foreground font-medium">
                Status
              </th>
              <th className="py-2.5 px-4 text-left text-xs text-muted-foreground font-medium">
                Start Date
              </th>
              <th className="py-2.5 px-4 text-left text-xs text-muted-foreground font-medium">
                End Date
              </th>
              <th className="py-2.5 px-4 text-left text-xs text-muted-foreground font-medium">
                Supporting Artifacts
              </th>
              <th className="w-10 py-2.5 px-2" />
            </tr>
          </thead>
          <tbody>
            {milestones.map((m) => {
              const isLoading = actionLoading === m.id

              return (
                <tr
                  key={m.id}
                  className="border-t hover:bg-muted/20 transition-colors"
                >
                  {/* Name */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <StatusIcon status={m.status} />
                      {editingId === m.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-7 text-sm w-40"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveName(m.id)
                              if (e.key === "Escape") setEditingId(null)
                            }}
                            autoFocus
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-emerald-500 hover:text-emerald-600 cursor-pointer"
                            onClick={() => handleSaveName(m.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm font-medium">{m.name}</span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <StatusBadge status={m.status} />
                  </td>

                  {/* Start Date */}
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {formatDate(m.start_date)}
                  </td>

                  {/* End Date */}
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {formatDate(m.end_date)}
                  </td>

                  {/* Supporting Artifacts */}
                  {(() => {
                    const arts = (m.artifacts as MilestoneArtifactEntry[]) ?? []
                    const first = arts[0]

                    return (
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          {first ? (
                            <>
                              {first.type === "file" ? (
                                <Link
                                  href={first.file_path}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1.5 text-sm text-foreground hover:text-primary transition-colors max-w-[160px]"
                                >
                                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                                  <span className="truncate">
                                    {first.file_name}
                                  </span>
                                </Link>
                              ) : (
                                <Link
                                  href={first.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-1.5 text-sm text-foreground hover:text-primary transition-colors max-w-[160px]"
                                >
                                  <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                                  <span className="truncate">{first.url}</span>
                                </Link>
                              )}
                            </>
                          ) : (
                            <>
                              {/* No artifacts */}
                              <span className="text-sm text-muted-foreground">
                                —
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                    )
                  })()}

                  {/* Actions */}
                  <td className="py-3 px-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground cursor-pointer"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <MoreVertical className="h-4 w-4" />
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-52">
                        {/* Mark In Progress — available to all users */}
                        {m.status === MilestoneStatus.INCOMPLETE && (
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() =>
                              handleStatusChange(
                                m.id,
                                MilestoneStatus.IN_PROGRESS
                              )
                            }
                          >
                            <Clock className="h-3.5 w-3.5 mr-2 text-blue-500" />
                            Mark In Progress
                          </DropdownMenuItem>
                        )}

                        {/* Student actions */}
                        {!canManage &&
                          (m.status === MilestoneStatus.IN_PROGRESS ? (
                            <>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => setArtifactDialogId(m.id)}
                              >
                                <FileText className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                Manage Artifacts
                                {(m.artifacts as MilestoneArtifactEntry[])
                                  ?.length > 0 && (
                                  <span className="ml-auto text-xs text-muted-foreground">
                                    {
                                      (m.artifacts as MilestoneArtifactEntry[])
                                        .length
                                    }
                                  </span>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => {
                                  const arts =
                                    (m.artifacts as MilestoneArtifactEntry[]) ??
                                    []
                                  if (arts.length === 0) {
                                    // No artifacts yet — open the modal so the student can add one first
                                    toast({
                                      title:
                                        "Add at least one artifact before marking as Done",
                                      variant: "destructive"
                                    })
                                    setArtifactDialogId(m.id)
                                  } else {
                                    handleStatusChange(
                                      m.id,
                                      MilestoneStatus.COMPLETED_PENDING_VERIFICATION
                                    )
                                  }
                                }}
                              >
                                <Clock className="h-3.5 w-3.5 mr-2 text-primary" />
                                Complete (Pending Verification)
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <>
                              {/* Show Manage Artifacts for DONE_PENDING_VERIFICATION */}
                              {m.status ===
                                MilestoneStatus.COMPLETED_PENDING_VERIFICATION && (
                                <>
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() => setArtifactDialogId(m.id)}
                                  >
                                    <FileText className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                    Manage Artifacts
                                    {(m.artifacts as MilestoneArtifactEntry[])
                                      ?.length > 0 && (
                                      <span className="ml-auto text-xs text-muted-foreground">
                                        {
                                          (
                                            m.artifacts as MilestoneArtifactEntry[]
                                          ).length
                                        }
                                      </span>
                                    )}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                </>
                              )}
                              {/* Show View Artifacts for COMPLETED */}
                              {m.status === MilestoneStatus.VERIFIED && (
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() => setArtifactDialogId(m.id)}
                                >
                                  <FileText className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                  View Artifacts
                                  {(m.artifacts as MilestoneArtifactEntry[])
                                    ?.length > 0 && (
                                    <span className="ml-auto text-xs text-muted-foreground">
                                      {
                                        (
                                          m.artifacts as MilestoneArtifactEntry[]
                                        ).length
                                      }
                                    </span>
                                  )}
                                </DropdownMenuItem>
                              )}
                              {m.status !== MilestoneStatus.INCOMPLETE && (
                                <div className="px-2 py-2 space-y-0.5">
                                  <p className="text-xs font-medium text-muted-foreground/60">
                                    {m.status === MilestoneStatus.VERIFIED
                                      ? "Milestone Verified"
                                      : "Complete (Pending Verification)"}
                                  </p>
                                  <p className="text-xs text-muted-foreground/50 leading-snug">
                                    {m.status === MilestoneStatus.VERIFIED
                                      ? "Verified and approved by your advisor."
                                      : "Already submitted for verification."}
                                  </p>
                                </div>
                              )}
                            </>
                          ))}

                        {/* Advisor / University Admin actions */}
                        {canManage && (
                          <>
                            {(m.artifacts as MilestoneArtifactEntry[])?.length >
                              0 && (
                              <>
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() => setArtifactDialogId(m.id)}
                                >
                                  <FileText className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                                  View Artifacts
                                  <span className="ml-auto text-xs text-muted-foreground">
                                    {
                                      (m.artifacts as MilestoneArtifactEntry[])
                                        .length
                                    }
                                  </span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            {canVerifyMilestone &&
                              m.status ===
                                MilestoneStatus.COMPLETED_PENDING_VERIFICATION && (
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() =>
                                    handleStatusChange(
                                      m.id,
                                      MilestoneStatus.VERIFIED
                                    )
                                  }
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                                  Verify
                                </DropdownMenuItem>
                              )}

                            {canRevertMilestone &&
                              (m.status === MilestoneStatus.IN_PROGRESS ||
                                m.status ===
                                  MilestoneStatus.COMPLETED_PENDING_VERIFICATION ||
                                m.status === MilestoneStatus.VERIFIED) && (
                                <DropdownMenuItem
                                  className="cursor-pointer text-amber-600 focus:text-amber-600"
                                  onClick={() => handleRevert(m.id, m.status)}
                                >
                                  <RotateCcw className="h-3.5 w-3.5 mr-2" />
                                  Revert Status
                                </DropdownMenuItem>
                              )}

                            {canUpdateMilestone &&
                              m.status !== MilestoneStatus.VERIFIED && (
                                <DropdownMenuItem
                                  className="cursor-pointer"
                                  onClick={() => handleStartEdit(m)}
                                >
                                  <Pencil className="h-3.5 w-3.5 mr-2" />
                                  Rename
                                </DropdownMenuItem>
                              )}

                            {canDeleteMilestone && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="cursor-pointer text-destructive focus:text-destructive"
                                  onClick={() => handleDelete(m.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Artifact manage dialog */}
      {artifactDialogId &&
        (() => {
          const m = milestones.find((x) => x.id === artifactDialogId)
          if (!m) return null
          return (
            <ArtifactManageDialog
              open={!!artifactDialogId}
              milestoneId={artifactDialogId}
              artifacts={(m.artifacts as MilestoneArtifactEntry[]) ?? []}
              status={m.status as MilestoneStatus}
              isStudent={!canManage}
              onClose={() => setArtifactDialogId(null)}
              onArtifactsChanged={(updated) =>
                updateDialogMilestone(artifactDialogId, { artifacts: updated })
              }
              onMarkDone={() =>
                updateDialogMilestone(artifactDialogId, {
                  status: MilestoneStatus.COMPLETED_PENDING_VERIFICATION
                })
              }
              onMarkCompleted={() =>
                updateDialogMilestone(artifactDialogId, {
                  status: MilestoneStatus.VERIFIED
                })
              }
            />
          )
        })()}

      {/* Legend */}
      <div className="flex flex-wrap items-start gap-x-8 gap-y-3 pt-1">
        {[
          {
            icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
            title: "Completed",
            desc: "Verified by Advisor"
          },
          {
            icon: <Clock className="h-4 w-4 text-amber-500" />,
            title: "Done (Pending Verification)",
            desc: "Submitted by Student"
          },
          {
            icon: <Clock className="h-4 w-4 text-blue-500" />,
            title: "In Progress",
            desc: "Work in Progress"
          },
          {
            icon: <Circle className="h-4 w-4 text-muted-foreground/40" />,
            title: "Incomplete",
            desc: "Not Started"
          }
        ].map(({ icon, title, desc }) => (
          <div key={title} className="flex items-center gap-2">
            <div className="shrink-0 mt-0.5">{icon}</div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-foreground leading-tight">
                {title}
              </span>
              <span className="text-xs text-muted-foreground leading-tight">
                {desc}
              </span>
            </div>
          </div>
        ))}
        <div className="flex items-start gap-2 ml-auto">
          <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <span className="text-xs text-muted-foreground max-w-[200px] leading-snug">
            Only Advisors and University Admins can verify or modify milestones.
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

function FYPMilestones() {
  const currentSpace = useAtomValue(spaceStore.currentSpace)
  const spaceId = currentSpace?.id
  const communityId = currentSpace?.channel?.community_id ?? undefined
  const [view, setView] = useState<View>("milestones")
  const [milestones, setMilestones] = useState<SelectProjectMilestone[]>([])
  const [loadingMs, setLoadingMs] = useState(true)
  const [, , , fetchMilestones] = useServerAction(GetMilestonesForSpaceAction)

  // industry_partner: fyp permissions are GLOBAL
  // community_admin: fyp permissions are SCOPED to COMMUNITY (entity_type='COMMUNITY')
  const { permissionChecker: globalChecker } = usePermissionChecker("global")
  const { permissionChecker: scopedChecker } = usePermissionChecker(
    "scoped",
    "COMMUNITY",
    communityId
  )

  // Check a fyp permission against both global (advisor) and community-scoped (university admin) checkers
  const canFyp = (action: string): boolean =>
    (globalChecker?.canAccess(action) ?? false) ||
    (scopedChecker?.canAccess(action) ?? false)

  const canCreateMilestone = canFyp("fyp.milestone.create")
  const canUpdateMilestone = canFyp("fyp.milestone.update")
  const canDeleteMilestone = canFyp("fyp.milestone.delete")
  const canVerifyMilestone = canFyp("fyp.milestone.verify")
  const canRevertMilestone = canFyp("fyp.milestone.revert")

  const canManage =
    canCreateMilestone ||
    canUpdateMilestone ||
    canDeleteMilestone ||
    canVerifyMilestone ||
    canRevertMilestone

  const load = useCallback(async () => {
    if (!spaceId) return
    setLoadingMs(true)
    try {
      const res = await fetchMilestones(spaceId)
      if (res?.success && res.data) {
        setMilestones(res.data as SelectProjectMilestone[])
        setView(res.data.length > 0 ? "milestones" : "setup")
      }
    } finally {
      setLoadingMs(false)
    }
  }, [spaceId])

  useEffect(() => {
    load()
  }, [load])

  if (loadingMs) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size={LoaderSizes.xl} />
      </div>
    )
  }

  if (view === "setup" && !canManage) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          No milestones have been set up for this project yet.
        </p>
        <p className="text-xs text-muted-foreground">
          An Advisor or University Admin will configure them soon.
        </p>
      </div>
    )
  }

  if (view === "setup") {
    return (
      <MilestoneSetup
        spaceId={spaceId!}
        initialMilestones={milestones.length > 0 ? milestones : undefined}
        onCancel={
          milestones.length > 0 ? () => setView("milestones") : undefined
        }
        onComplete={(created) => {
          setMilestones(created)
          setView("milestones")
        }}
      />
    )
  }

  return (
    <MilestoneView
      milestones={milestones}
      canManage={canManage}
      canCreateMilestone={canCreateMilestone}
      canUpdateMilestone={canUpdateMilestone}
      canDeleteMilestone={canDeleteMilestone}
      canVerifyMilestone={canVerifyMilestone}
      canRevertMilestone={canRevertMilestone}
      onSetupAgain={() => setView("setup")}
    />
  )
}

export default FYPMilestones
