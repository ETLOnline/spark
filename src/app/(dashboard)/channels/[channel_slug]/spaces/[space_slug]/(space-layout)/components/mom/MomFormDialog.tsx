"use client"

import { useEffect, useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Label } from "@/src/components/ui/label"
import { Checkbox } from "@/src/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/src/components/ui/dialog"
import MultiSelect, {
  MultiSelectOption
} from "@/src/components/ui/multi-select"
import { SelectMom } from "@/src/db/schema"
import { MomFormState, EMPTY_MOM_FORM } from "./MomTypes"

function toFormState(initial?: SelectMom): MomFormState {
  return initial
    ? {
        meeting_date: initial.meeting_date,
        meeting_start_time: initial.meeting_start_time,
        meeting_end_time: initial.meeting_end_time,
        participants: initial.participants,
        discussion_summary: initial.discussion_summary,
        action_items: initial.action_items
      }
    : EMPTY_MOM_FORM
}

function MomFormDialog({
  open,
  initial,
  isSubmitting,
  participantOptions,
  participantsLoading,
  onClose,
  onSave
}: {
  open: boolean
  initial?: SelectMom
  isSubmitting?: boolean
  participantOptions: MultiSelectOption[]
  participantsLoading?: boolean
  onClose: () => void
  onSave: (form: MomFormState) => void
}) {
  const [form, setForm] = useState<MomFormState>(() => toFormState(initial))
  const [errors, setErrors] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (open) {
      setForm(toFormState(initial))
      setErrors({})
    }
  }, [open, initial])

  const selectedParticipants = participantOptions.filter((o) =>
    form.participants.includes(o.value)
  )

  const handleParticipantsChange = (values: MultiSelectOption[]) => {
    setForm((prev) => ({
      ...prev,
      participants: values.map((v) => v.value)
    }))
  }

  const handleAddActionItem = () => {
    setForm((prev) => ({
      ...prev,
      action_items: [
        ...prev.action_items,
        { id: crypto.randomUUID(), text: "", done: false }
      ]
    }))
  }

  const handleActionItemChange = (id: string, text: string) => {
    setForm((prev) => ({
      ...prev,
      action_items: prev.action_items.map((a) =>
        a.id === id ? { ...a, text } : a
      )
    }))
  }

  const handleActionItemToggle = (id: string) => {
    setForm((prev) => ({
      ...prev,
      action_items: prev.action_items.map((a) =>
        a.id === id ? { ...a, done: !a.done } : a
      )
    }))
  }

  const handleRemoveActionItem = (id: string) => {
    setForm((prev) => ({
      ...prev,
      action_items: prev.action_items.filter((a) => a.id !== id)
    }))
  }

  const handleSubmit = () => {
    const nextErrors: Record<string, boolean> = {
      meeting_date: !form.meeting_date,
      meeting_start_time: !form.meeting_start_time,
      meeting_end_time: !form.meeting_end_time,
      meeting_time_range:
        !!form.meeting_start_time &&
        !!form.meeting_end_time &&
        form.meeting_end_time <= form.meeting_start_time,
      discussion_summary: !form.discussion_summary.trim()
    }
    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors)
      return
    }
    setErrors({})
    onSave({
      ...form,
      action_items: form.action_items.filter((a) => a.text.trim())
    })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initial ? "Edit Minutes of Meeting" : "Log Minutes of Meeting"}
          </DialogTitle>
          <DialogDescription>
            Record what was discussed and agreed so the space keeps an accurate
            history.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Date & Time */}
          <div className="space-y-1.5">
            <Label htmlFor="mom-date">
              Meeting Date <span className="text-destructive">*</span>
            </Label>
            <Input
              id="mom-date"
              type="date"
              value={form.meeting_date}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  meeting_date: e.target.value
                }))
              }
              className={
                errors.meeting_date
                  ? "border-destructive focus-visible:ring-destructive/40"
                  : ""
              }
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="mom-start-time">
                Start Time <span className="text-destructive">*</span>
              </Label>
              <Input
                id="mom-start-time"
                type="time"
                value={form.meeting_start_time}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    meeting_start_time: e.target.value
                  }))
                }
                className={
                  errors.meeting_start_time
                    ? "border-destructive focus-visible:ring-destructive/40"
                    : ""
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mom-end-time">
                End Time <span className="text-destructive">*</span>
              </Label>
              <Input
                id="mom-end-time"
                type="time"
                value={form.meeting_end_time}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    meeting_end_time: e.target.value
                  }))
                }
                className={
                  errors.meeting_end_time || errors.meeting_time_range
                    ? "border-destructive focus-visible:ring-destructive/40"
                    : ""
                }
              />
              {errors.meeting_time_range && (
                <p className="text-xs text-destructive">
                  End time must be after start time.
                </p>
              )}
            </div>
          </div>

          {/* Participants */}
          <div className="space-y-1.5">
            <Label>Participants</Label>
            <MultiSelect
              options={participantOptions}
              selected={selectedParticipants}
              onChange={handleParticipantsChange}
              loading={participantsLoading}
              placeholder="Select space members"
            />
          </div>

          {/* Discussion Summary */}
          <div className="space-y-1.5">
            <Label htmlFor="mom-summary">
              Discussion Summary <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="mom-summary"
              rows={4}
              placeholder="What was discussed, agreed, or decided in this meeting?"
              value={form.discussion_summary}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  discussion_summary: e.target.value
                }))
              }
              className={
                errors.discussion_summary
                  ? "border-destructive focus-visible:ring-destructive/40"
                  : ""
              }
            />
          </div>

          {/* Action Items */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Action Items</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleAddActionItem}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Item
              </Button>
            </div>

            {form.action_items.length === 0 ? (
              <p className="text-xs text-muted-foreground border rounded-lg py-3 text-center">
                No action items yet. Add follow-ups or tasks from this meeting.
              </p>
            ) : (
              <div className="space-y-2">
                {form.action_items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={item.done}
                      onCheckedChange={() => handleActionItemToggle(item.id)}
                    />
                    <Input
                      value={item.text}
                      placeholder="Describe the action item"
                      onChange={(e) =>
                        handleActionItemChange(item.id, e.target.value)
                      }
                      className={`h-8 text-sm ${item.done ? "line-through text-muted-foreground" : ""}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground/60 hover:text-destructive shrink-0 cursor-pointer"
                      onClick={() => handleRemoveActionItem(item.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={isSubmitting}>
            {initial ? "Save Changes" : "Save Minutes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default MomFormDialog
