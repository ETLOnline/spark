"use client"

import { Users, Video } from "lucide-react"
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
  TimeRange
} from "./mentorCalendarUtils"
import { toMins } from "@/src/utils/time"

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
  error
}: SessionRequestFormProps) {
  return (
    <>
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

      {/* Topic */}
      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">
          Topic
        </Label>
        <Input
          value={topic}
          placeholder="What do you want to discuss?"
          onChange={(e) => onTopicChange(e.target.value)}
          className={cn(error && "border-destructive")}
        />
      </div>

      {/* Description */}
      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">
          Description <span className="opacity-60">(optional)</span>
        </Label>
        <Textarea
          value={description}
          placeholder="Add context, background, or specific questions"
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={4}
        />
      </div>

      {error && <p className="text-destructive text-xs">{error}</p>}
    </>
  )
}
