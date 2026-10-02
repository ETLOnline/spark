"use client"

import { useEffect } from "react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { MomFormState, EMPTY_MOM_FORM, momFormSchema } from "./MomTypes"

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
  const form = useForm<MomFormState>({
    resolver: zodResolver(momFormSchema),
    defaultValues: EMPTY_MOM_FORM
  })

  const { control, handleSubmit, watch, reset } = form
  const errors = form.formState.errors

  const { fields, append, remove } = useFieldArray({
    control,
    name: "action_items",
    keyName: "fieldId"
  })

  useEffect(() => {
    if (open) {
      reset(toFormState(initial))
    }
  }, [open, initial, reset])

  const participants = watch("participants")
  const selectedParticipants = participantOptions.filter((o) =>
    participants?.includes(o.value)
  )

  const handleAddActionItem = () => {
    append({ id: crypto.randomUUID(), text: "", done: false })
  }

  const submitData = (data: MomFormState) => {
    onSave({
      ...data,
      action_items: data.action_items.filter((a) => a.text.trim())
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
            <Controller
              name="meeting_date"
              control={control}
              render={({ field }) => (
                <Input
                  id="mom-date"
                  type="date"
                  {...field}
                  className={
                    errors.meeting_date
                      ? "border-destructive focus-visible:ring-destructive/40"
                      : ""
                  }
                />
              )}
            />
            {errors.meeting_date && (
              <p className="text-xs text-destructive">
                {errors.meeting_date.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="mom-start-time">
                Start Time <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="meeting_start_time"
                control={control}
                render={({ field }) => (
                  <Input
                    id="mom-start-time"
                    type="time"
                    {...field}
                    className={
                      errors.meeting_start_time
                        ? "border-destructive focus-visible:ring-destructive/40"
                        : ""
                    }
                  />
                )}
              />
              {errors.meeting_start_time && (
                <p className="text-xs text-destructive">
                  {errors.meeting_start_time.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mom-end-time">
                End Time <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="meeting_end_time"
                control={control}
                render={({ field }) => (
                  <Input
                    id="mom-end-time"
                    type="time"
                    {...field}
                    className={
                      errors.meeting_end_time
                        ? "border-destructive focus-visible:ring-destructive/40"
                        : ""
                    }
                  />
                )}
              />
              {errors.meeting_end_time && (
                <p className="text-xs text-destructive">
                  {errors.meeting_end_time.message}
                </p>
              )}
            </div>
          </div>

          {/* Participants */}
          <div className="space-y-1.5">
            <Label>Participants</Label>
            <Controller
              name="participants"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  options={participantOptions}
                  selected={selectedParticipants}
                  onChange={(values) =>
                    field.onChange(values.map((v) => v.value))
                  }
                  loading={participantsLoading}
                  placeholder="Select space members"
                />
              )}
            />
          </div>

          {/* Discussion Summary */}
          <div className="space-y-1.5">
            <Label htmlFor="mom-summary">
              Discussion Summary <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="discussion_summary"
              control={control}
              render={({ field }) => (
                <Textarea
                  id="mom-summary"
                  rows={4}
                  placeholder="What was discussed, agreed, or decided in this meeting?"
                  {...field}
                  className={
                    errors.discussion_summary
                      ? "border-destructive focus-visible:ring-destructive/40"
                      : ""
                  }
                />
              )}
            />
            {errors.discussion_summary && (
              <p className="text-xs text-destructive">
                {errors.discussion_summary.message}
              </p>
            )}
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

            {fields.length === 0 ? (
              <p className="text-xs text-muted-foreground border rounded-lg py-3 text-center">
                No action items yet. Add follow-ups or tasks from this meeting.
              </p>
            ) : (
              <div className="space-y-2">
                {fields.map((item, index) => (
                  <div key={item.fieldId} className="flex items-center gap-2">
                    <Controller
                      name={`action_items.${index}.done`}
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={() => field.onChange(!field.value)}
                        />
                      )}
                    />
                    <Controller
                      name={`action_items.${index}.text`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Describe the action item"
                          className={`h-8 text-sm ${
                            watch(`action_items.${index}.done`)
                              ? "line-through text-muted-foreground"
                              : ""
                          }`}
                        />
                      )}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground/60 hover:text-destructive shrink-0 cursor-pointer"
                      onClick={() => remove(index)}
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
          <Button onClick={handleSubmit(submitData)} loading={isSubmitting}>
            {initial ? "Save Changes" : "Save Minutes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default MomFormDialog
