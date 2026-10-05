"use client"

import { useRef, useState } from "react"
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
  verticalListSortingStrategy,
  arrayMove
} from "@dnd-kit/sortable"
import {
  CheckCircle2,
  LayoutList,
  Loader2,
  Pencil,
  PlusCircle,
  ArrowUpDownIcon
} from "lucide-react"
import { Button } from "@/src/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/src/components/ui/alert-dialog"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  SetupMilestonesAction,
  ReconfigureMilestonesAction,
  DeleteMilestoneAction
} from "@/src/server-actions/Milestone/Milestone"
import type { MilestoneWithArtifacts } from "@/src/server-actions/Milestone/Milestone"
import { MilestoneStatus } from "@/src/types/Milestone/Milestone"
import { useToast } from "@/src/hooks/use-toast"
import {
  TEMPLATE_MILESTONES,
  CUSTOM_MILESTONE_FEATURES
} from "./constants"
import type { LocalMilestone } from "./LocalMilestone"
import { SortableRow } from "./SortableRow"

type SetupMode = "template" | "custom"

export function MilestoneSetup({
  spaceId,
  initialMilestones,
  onCancel,
  onComplete,
  onMilestoneDeleted
}: {
  spaceId: string
  initialMilestones?: MilestoneWithArtifacts[]
  onCancel?: () => void
  onComplete: (milestones: MilestoneWithArtifacts[]) => void
  onMilestoneDeleted?: (deletedId: string) => void
}) {
  const { toast } = useToast()

  // ── Row caches: one per mode so switching back restores the previous state ──
  // Computed once via useRef so both the cache and the active rows share the
  // same UUIDs on mount (avoids a duplicate call that would generate new keys).
  const _initCustom = useRef<LocalMilestone[]>(
    initialMilestones && initialMilestones.length > 0
      ? initialMilestones.map((m) => ({
          id: crypto.randomUUID(),
          dbId: m.id,
          name: m.name,
          start_date: m.start_date ?? "",
          end_date: m.end_date ?? ""
        }))
      : [{ id: crypto.randomUUID(), name: "", start_date: "", end_date: "" }]
  )
  const _initTemplate = useRef<LocalMilestone[]>(
    TEMPLATE_MILESTONES.map((name) => ({
      id: crypto.randomUUID(),
      name,
      start_date: "",
      end_date: ""
    }))
  )

  const initialMode: SetupMode =
    initialMilestones && initialMilestones.length > 0 ? "custom" : "template"

  const [mode, setMode] = useState<SetupMode>(initialMode)
  const [templateRowsCache, setTemplateRowsCache] = useState<LocalMilestone[]>(
    _initTemplate.current
  )
  const [customRowsCache, setCustomRowsCache] = useState<LocalMilestone[]>(
    _initCustom.current
  )

  // Active rows — starts in sync with the matching cache
  const [rows, setRows] = useState<LocalMilestone[]>(
    initialMode === "custom" ? _initCustom.current : _initTemplate.current
  )

  const sensors = useSensors(useSensor(PointerSensor))
  const isReconfigure = !!initialMilestones && initialMilestones.length > 0

  // ── Confirmation dialogs state ──
  // Fired when switching from custom → built-in template while reconfiguring
  const [confirmTemplateSwitch, setConfirmTemplateSwitch] = useState(false)
  // Fired when deleting a row whose DB milestone is in_progress + has artifacts
  const [confirmDelete, setConfirmDelete] = useState<{
    rowId: string
    name: string
  } | null>(null)

  const [isSettingUp, , , setupMilestones] = useServerAction(
    SetupMilestonesAction
  )
  const [isReconfiguring, , , reconfigureMilestones] = useServerAction(
    ReconfigureMilestonesAction
  )
  const [, , , deleteMilestoneRow] = useServerAction(DeleteMilestoneAction)
  const isSubmitting = isSettingUp || isReconfiguring
  const [deletingRowId, setDeletingRowId] = useState<string | null>(null)
  const [dateErrors, setDateErrors] = useState<
    Record<string, { start_date: boolean; end_date: boolean }>
  >({})

  // Saves current rows into the active mode's cache, then switches to the other mode
  // and restores its cached rows — so switching back always preserves what was there.
  const applyModeChange = (newMode: SetupMode) => {
    if (newMode === mode) return
    if (mode === "template") {
      setTemplateRowsCache(rows)
      setRows(customRowsCache)
    } else {
      setCustomRowsCache(rows)
      setRows(templateRowsCache)
    }
    setMode(newMode)
  }

  const handleModeChange = (m: SetupMode) => {
    applyModeChange(m)
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

  // Removes the row from the table and, if it has a DB record, deletes it immediately.
  const doDeleteRow = async (id: string) => {
    const row = rows.find((r) => r.id === id)

    if (row?.dbId) {
      // Existing DB milestone — delete immediately so Cancel still reflects the change
      setDeletingRowId(id)
      try {
        const res = await deleteMilestoneRow(row.dbId)
        if (res?.success) {
          setRows((prev) => prev.filter((r) => r.id !== id))
          // Also keep the caches in sync
          setCustomRowsCache((prev) => prev.filter((r) => r.id !== id))
          toast({ title: "Milestone deleted" })
          onMilestoneDeleted?.(row.dbId)
        } else {
          toast({
            title:
              (res as { message?: string })?.message ??
              "Failed to delete milestone",
            variant: "destructive"
          })
        }
      } catch {
        toast({ title: "Failed to delete milestone", variant: "destructive" })
      } finally {
        setDeletingRowId(null)
      }
    } else {
      // New row (not yet in DB) — just remove from the table
      setRows((prev) => prev.filter((r) => r.id !== id))
      toast({ title: "Milestone removed." })
    }
  }

  const handleDeleteRow = (id: string) => {
    if (isReconfigure) {
      const row = rows.find((r) => r.id === id)
      if (row?.dbId) {
        const dbM = initialMilestones?.find((m) => m.id === row.dbId)
        if (
          dbM &&
          dbM.status === MilestoneStatus.IN_PROGRESS &&
          dbM.artifacts.length > 0
        ) {
          setConfirmDelete({ rowId: id, name: row.name || "this milestone" })
          return
        }
      }
    }
    doDeleteRow(id)
  }

  const handleAdd = () => {
    setRows((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: "", start_date: "", end_date: "" }
    ])
  }

  // Runs the actual API call — called either directly or after confirm
  const doSubmit = async () => {
    try {
      if (isReconfigure) {
        const inputs = rows.map((r, i) => ({
          id: r.dbId,
          name: r.name.trim(),
          start_date: r.start_date,
          end_date: r.end_date,
          order_index: i
        }))
        const res = await reconfigureMilestones(spaceId, inputs)
        if (res?.success && res.data) {
          toast({ title: "Milestones updated successfully" })
          onComplete(res.data as MilestoneWithArtifacts[])
        } else {
          toast({
            title: "Failed to update milestones",
            description: (res as { message?: string })?.message,
            variant: "destructive"
          })
        }
      } else {
        const inputs = rows.map((r, i) => ({
          name: r.name.trim(),
          start_date: r.start_date,
          end_date: r.end_date,
          order_index: i
        }))
        const res = await setupMilestones(spaceId, inputs)
        if (res?.success && res.data) {
          toast({ title: "Milestones set up successfully" })
          onComplete(res.data as MilestoneWithArtifacts[])
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

  // Validates, then either shows the confirmation dialog (for destructive reconfigure)
  // or submits directly
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

    // Show confirmation when applying built-in template over existing custom milestones
    if (isReconfigure && mode === "template") {
      setConfirmTemplateSwitch(true)
      return
    }

    await doSubmit()
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
        <h2 className="text-lg font-semibold">No milestones yet</h2>
        <p className="text-sm text-muted-foreground">
          Set up a template or create custom milestones to get started.
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
            <p className="text-xs text-muted-foreground mt-1">
              Adjust names and dates. You can edit them further after applying.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={handleAdd}>
            <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
            Add Milestone
          </Button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="w-14 py-2 pl-2 text-left text-sm text-muted-foreground font-medium">
                    <ArrowUpDownIcon className="h-4 w-4" />
                  </th>
                  <th className="w-12 py-2 text-left text-sm text-muted-foreground font-medium">
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
                          start_date: "",
                          end_date: ""
                        }
                      }
                      isDeleting={deletingRowId === row.id}
                      onChange={handleChange}
                      onDelete={handleDeleteRow}
                    />
                  ))}
                </tbody>
              </SortableContext>
            </table>
          </div>
        </DndContext>
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

      {/* ── Confirm: switching custom → built-in template ── */}
      <AlertDialog
        open={confirmTemplateSwitch}
        onOpenChange={setConfirmTemplateSwitch}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Switch to built-in template?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                Switching to the built-in FYP template will replace your current
                custom milestones. Any artifacts (files &amp; links) that
                students have already submitted may be removed when you apply.
              </span>
              <span className="block text-destructive font-medium">
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep custom milestones</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async (e) => {
                e.preventDefault()
                setConfirmTemplateSwitch(false)
                await doSubmit()
              }}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Yes, apply template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Confirm: deleting an in-progress milestone that has artifacts ── */}
      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(v) => {
          if (!v) setConfirmDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove milestone with submitted work?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                <strong>{confirmDelete?.name}</strong> is currently{" "}
                <strong>In Progress</strong> and has student-submitted
                artifacts. Removing it from the configuration will delete those
                artifacts when you apply.
              </span>
              <span className="block text-destructive font-medium">
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDelete(null)}>
              Keep milestone
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (confirmDelete) doDeleteRow(confirmDelete.rowId)
                setConfirmDelete(null)
              }}
            >
              Yes, remove it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
