"use client"

import { Sparkles, Users, Video } from "lucide-react"
import { Label } from "@/src/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/src/components/ui/select"
import { SelectMentorAvailability } from "@/src/db/schema"
import {
  formatDuration,
  formatTime,
  getDurationOptions,
  getStartTimeOptions,
  minsToTime
} from "./mentorCalendarUtils"
import { toMins } from "@/src/utils/time"

interface SuggestedSlotFormProps {
  slot: SelectMentorAvailability
  startTime: string
  onStartTimeChange: (value: string) => void
  duration: number
  onDurationChange: (value: number) => void
  error: string
}

export function SuggestedSlotForm({
  slot,
  startTime,
  onStartTimeChange,
  duration,
  onDurationChange,
  error
}: SuggestedSlotFormProps) {
  return (
    <>
      <p className="text-xs text-purple-500 font-medium flex items-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5" />
        Suggested slot — pick your preferred time
      </p>

      {/* Session Type (static display) */}
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
              {getStartTimeOptions(slot, []).map((t) => (
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
              {getDurationOptions(slot, startTime, []).map((d) => (
                <SelectItem key={d} value={String(d)}>
                  {formatDuration(d)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-xs text-muted-foreground -mt-1">
        Your session: {formatTime(startTime)} –{" "}
        {formatTime(minsToTime(toMins(startTime) + duration))}
      </p>

      {error && <p className="text-destructive text-xs">{error}</p>}
    </>
  )
}
