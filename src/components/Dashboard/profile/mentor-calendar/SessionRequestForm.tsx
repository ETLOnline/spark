"use client"

import moment from "moment-timezone"
import { CalendarDays, Users, Video } from "lucide-react"
import { Checkbox } from "@/src/components/ui/checkbox"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/src/components/ui/select"
import { cn } from "@/src/lib/utils"
import { SelectMentorAvailability } from "@/src/db/schema"
import {
  formatDuration,
  formatTime,
  getDurationOptions,
  getStartTimeOptions,
  minsToTime,
  repeatLabel,
  TimeRange
} from "./mentorCalendarUtils"
import { toMins } from "@/src/utils/time"
import {
  SESSION_REQUEST_DESCRIPTION_MAX_LENGTH,
  SESSION_REQUEST_TOPIC_MAX_LENGTH
} from "@/src/utils/constants"

interface SessionRequestFormProps {
  slot: SelectMentorAvailability
  unavailableRanges: TimeRange[]
  startTime: string
  onStartTimeChange: (value: string) => void
  duration: number
  onDurationChange: (value: number) => void
  topic: string
  onTopicChange: (value: string) => void
  description: string
  onDescriptionChange: (value: string) => void
  recurring: boolean
  onRecurringChange: (value: boolean) => void
  sessionDateStr: string
  repeatEndDate: string
  onRepeatEndDateChange: (value: string) => void
  error: string
}

export function SessionRequestForm({
  slot,
  unavailableRanges,
  startTime,
  onStartTimeChange,
  duration,
  onDurationChange,
  topic,
  onTopicChange,
  description,
  onDescriptionChange,
  recurring,
  onRecurringChange,
  sessionDateStr,
  repeatEndDate,
  onRepeatEndDateChange,
  error
}: SessionRequestFormProps) {
  return (
    <>
      {/* Date — the anchor occurrence this request is for */}
      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">
          Date
        </Label>
        <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-foreground/10 bg-muted/40">
          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          {sessionDateStr
            ? moment(sessionDateStr, "YYYY-MM-DD").format("dddd, MMMM D, YYYY")
            : "—"}
        </div>
      </div>

      {/* Session Type (inherited from the slot, not editable) */}
      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">
          Session Type
        </Label>
        <div className="flex items-center gap-2 text-sm px-3 py-2 rounded-md border border-foreground/10 bg-muted/40">
          {slot.session_type === "group" ? (
            <Users className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <Video className="h-3.5 w-3.5 text-muted-foreground" />
          )}
          {slot.session_type === "group" ? "Group" : "1-on-1"}
          <span className="text-muted-foreground ml-auto">
            Open {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
          </span>
        </div>
      </div>

      {/* Start Time / Duration */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">
            Start Time
          </Label>
          <Select value={startTime} onValueChange={onStartTimeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getStartTimeOptions(slot, unavailableRanges).map((t) => (
                <SelectItem key={t} value={t}>
                  {formatTime(t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">
            Duration
          </Label>
          <Select
            value={String(duration)}
            onValueChange={(v) => onDurationChange(Number(v))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getDurationOptions(slot, startTime, unavailableRanges).map(
                (d) => (
                  <SelectItem key={d} value={String(d)}>
                    {formatDuration(d)}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      <p className="text-xs text-muted-foreground -mt-1">
        Your session: {formatTime(startTime)} –{" "}
        {formatTime(minsToTime(toMins(startTime) + duration))}
      </p>

      {/* Recurring — only offered when the slot itself repeats */}
      {slot.repeat_type !== "none" && (
        <div className="rounded-md border border-foreground/10 bg-muted/40 px-3 py-2.5 space-y-2.5">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <Checkbox
              checked={recurring}
              onCheckedChange={(checked) => onRecurringChange(checked === true)}
              className="mt-0.5"
            />
            <span className="text-sm">
              <span className="font-medium">
                Request every {repeatLabel(slot).replace("Every ", "")}
              </span>
              <span className="block text-xs text-muted-foreground">
                Book this as a standing session instead of just this one date
              </span>
            </span>
          </label>

          {recurring && (
            <div className="pl-6">
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                Repeat until <span className="opacity-60">(optional)</span>
              </Label>
              <Input
                type="date"
                value={repeatEndDate}
                min={sessionDateStr}
                max={slot.repeat_end_date ?? undefined}
                step={slot.repeat_type === "weekly" ? 7 : undefined}
                onChange={(e) => onRepeatEndDateChange(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave as-is to match the mentor's full availability window
                {slot.repeat_end_date
                  ? ` (through ${slot.repeat_end_date})`
                  : ""}
                .
              </p>
            </div>
          )}
        </div>
      )}

      {/* Topic */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-xs text-muted-foreground">Topic</Label>
          <span className="text-xs text-muted-foreground">
            {topic.length}/{SESSION_REQUEST_TOPIC_MAX_LENGTH}
          </span>
        </div>
        <Input
          value={topic}
          placeholder="What do you want to discuss?"
          maxLength={SESSION_REQUEST_TOPIC_MAX_LENGTH}
          onChange={(e) => onTopicChange(e.target.value)}
          className={cn(error && "border-destructive")}
        />
      </div>

      {/* Description */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label className="text-xs text-muted-foreground">
            Description <span className="opacity-60">(optional)</span>
          </Label>
          <span className="text-xs text-muted-foreground">
            {description.length}/{SESSION_REQUEST_DESCRIPTION_MAX_LENGTH}
          </span>
        </div>
        <Textarea
          value={description}
          placeholder="Add context, background, or specific questions"
          maxLength={SESSION_REQUEST_DESCRIPTION_MAX_LENGTH}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={4}
        />
      </div>

      {error && <p className="text-destructive text-xs">{error}</p>}
    </>
  )
}
