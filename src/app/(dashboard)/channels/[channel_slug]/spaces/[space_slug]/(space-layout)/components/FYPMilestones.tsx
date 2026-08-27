"use client"

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
  GripVertical,
  Info,
  LayoutList,
  Loader2,
  MoreVertical,
  Pencil,
  PlusCircle,
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
import { userStore } from "@/src/store/user/userStore"
import { spaceStore } from "@/src/store/space/spaceStore"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  GetMilestonesForSpaceAction,
  SetupMilestonesAction,
  ReconfigureMilestonesAction,
  UpdateMilestoneAction,
  DeleteMilestoneAction,
  MilestoneInput,
  ReconfigureInput
} from "@/src/server-actions/Milestone/Milestone"
import { SelectProjectMilestone, MilestoneStatus } from "@/src/db/schema"
import { useToast } from "@/src/hooks/use-toast"
import moment from "moment"
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
  if (status === MilestoneStatus.COMPLETED)
    return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
  if (status === MilestoneStatus.DONE_PENDING_VERIFICATION)
    return <Clock className="h-5 w-5 text-primary" />
  if (status === MilestoneStatus.IN_PROGRESS)
    return <Clock className="h-5 w-5 text-blue-500" />
  return <Circle className="h-5 w-5 text-muted-foreground/40" />
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    [MilestoneStatus.COMPLETED]: {
      label: "Completed",
      className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20"
    },
    [MilestoneStatus.DONE_PENDING_VERIFICATION]: {
      label: "Done (Pending Verification)",
      className: "bg-primary/10 text-primary border-primary/20"
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

// ─── Progress Stepper ─────────────────────────────────────────────────────────

function MilestoneStepper({
  milestones
}: {
  milestones: SelectProjectMilestone[]
}) {
  return (
    <div className="flex items-start justify-between overflow-x-auto pb-2 mb-6">
      {milestones.map((m, i) => {
        const isCompleted = m.status === MilestoneStatus.COMPLETED
        const isInProgress =
          m.status === MilestoneStatus.IN_PROGRESS ||
          m.status === MilestoneStatus.DONE_PENDING_VERIFICATION
        const isLast = i === milestones.length - 1

        return (
          <div key={m.id} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold
                  ${isCompleted ? "border-emerald-500 bg-emerald-500 text-white" : ""}
                  ${isInProgress ? "border-blue-500 text-blue-500 bg-background" : ""}
                  ${!isCompleted && !isInProgress ? "border-muted-foreground/30 text-muted-foreground/50 bg-background" : ""}
                `}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : isInProgress ? (
                  <Clock className="h-4 w-4" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-xs text-center max-w-[72px] leading-tight
                  ${isCompleted ? "text-emerald-600 font-medium" : ""}
                  ${isInProgress ? "text-blue-600 font-medium" : ""}
                  ${!isCompleted && !isInProgress ? "text-muted-foreground" : ""}
                `}
              >
                {m.name}
              </span>
            </div>
            {!isLast && (
              <div
                className={`h-0.5 flex-1 mx-1 mt-[-18px] rounded-full transition-colors
                  ${isCompleted ? "bg-emerald-400" : "bg-muted-foreground/20"}
                `}
              />
            )}
          </div>
        )
      })}
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
  onSetupAgain
}: {
  milestones: SelectProjectMilestone[]
  canManage: boolean
  onSetupAgain: () => void
}) {
  const { toast } = useToast()
  const [milestones, setMilestones] = useState(initial)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const [, , , updateMilestone] = useServerAction(UpdateMilestoneAction)
  const [, , , deleteMilestone] = useServerAction(DeleteMilestoneAction)

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
        {canManage && (
          <Button size="sm" variant="outline" onClick={onSetupAgain}>
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Reconfigure
          </Button>
        )}
      </div>

      <MilestoneStepper milestones={milestones} />

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
                        {/* Student actions */}
                        {!canManage &&
                          (m.status === MilestoneStatus.IN_PROGRESS ? (
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() =>
                                handleStatusChange(
                                  m.id,
                                  MilestoneStatus.DONE_PENDING_VERIFICATION
                                )
                              }
                            >
                              <Clock className="h-3.5 w-3.5 mr-2 text-primary" />
                              Mark as Done
                            </DropdownMenuItem>
                          ) : (
                            <div className="px-2 py-2 space-y-0.5">
                              <p className="text-xs font-medium text-muted-foreground/60">
                                Mark as Done
                              </p>
                              <p className="text-xs text-muted-foreground/50 leading-snug">
                                {m.status ===
                                MilestoneStatus.DONE_PENDING_VERIFICATION
                                  ? "Already submitted for verification."
                                  : m.status === MilestoneStatus.COMPLETED
                                    ? "This milestone is already completed."
                                    : "Available once the milestone is In Progress."}
                              </p>
                            </div>
                          ))}

                        {/* Advisor / University Admin actions */}
                        {canManage && (
                          <>
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

                            {m.status ===
                              MilestoneStatus.DONE_PENDING_VERIFICATION && (
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() =>
                                  handleStatusChange(
                                    m.id,
                                    MilestoneStatus.COMPLETED
                                  )
                                }
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                                Mark as Completed
                              </DropdownMenuItem>
                            )}

                            {m.status !== MilestoneStatus.COMPLETED && (
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => handleStartEdit(m)}
                              >
                                <Pencil className="h-3.5 w-3.5 mr-2" />
                                Rename
                              </DropdownMenuItem>
                            )}

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
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-start gap-x-8 gap-y-3 pt-1">
        {[
          {
            icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
            title: "Completed",
            desc: "Verified by Advisor"
          },
          {
            icon: <Clock className="h-4 w-4 text-primary" />,
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
  const authUser = useAtomValue(userStore.AuthUser)
  const isSuperAdmin = useAtomValue(userStore.SuperAdmin)
  const currentSpace = useAtomValue(spaceStore.currentSpace)
  const spaceId = currentSpace?.id

  const [view, setView] = useState<View>("milestones")
  const [milestones, setMilestones] = useState<SelectProjectMilestone[]>([])
  const [loadingMs, setLoadingMs] = useState(true)
  const [, , , fetchMilestones] = useServerAction(GetMilestonesForSpaceAction)

  // Advisor = industry_partner (GLOBAL) | University Admin = community_admin (SCOPED)
  const canManage =
    isSuperAdmin ||
    !!authUser?.roles?.some(
      (r) =>
        r.role?.slug === "industry_partner" ||
        r.role?.slug === "community_admin"
    )

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
      onSetupAgain={() => setView("setup")}
    />
  )
}

export default FYPMilestones
