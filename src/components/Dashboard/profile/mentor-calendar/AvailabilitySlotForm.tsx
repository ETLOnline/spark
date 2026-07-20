"use client"

import moment from "moment-timezone"
import { RefreshCw, Users, Video } from "lucide-react"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { cn } from "@/src/lib/utils"
import { DAY_HEADERS } from "@/src/utils/constants"
import {
  endOfMonth,
  RepeatType,
  SessionType,
  toggleItemCls
} from "./mentorCalendarUtils"

interface AvailabilitySlotFormProps {
  today: Date
  newDate: string
  onDateChange: (value: string) => void
  newStart: string
  onStartChange: (value: string) => void
  newEnd: string
  onEndChange: (value: string) => void
  newSession: SessionType
  onSessionChange: (value: SessionType) => void
  newRepeat: RepeatType
  onRepeatChange: (value: RepeatType) => void
  newRepeatDays: number[]
  onRepeatDaysChange: (updater: (prev: number[]) => number[]) => void
  newRepeatEnd: string
  onRepeatEndChange: (value: string) => void
  slotError: string
  onClearSlotError: () => void
}

export function AvailabilitySlotForm({
  today,
  newDate,
  onDateChange,
  newStart,
  onStartChange,
  newEnd,
  onEndChange,
  newSession,
  onSessionChange,
  newRepeat,
  onRepeatChange,
  newRepeatDays,
  onRepeatDaysChange,
  newRepeatEnd,
  onRepeatEndChange,
  slotError,
  onClearSlotError
}: AvailabilitySlotFormProps) {
  return (
    <>
      {/* Session Type */}
      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">
          Session Type
        </Label>
        <div className="flex rounded-md border border-foreground/10 overflow-hidden">
          {(["1:1", "group"] as SessionType[]).map((t, i) => (
            <button
              key={t}
              type="button"
              onClick={() => onSessionChange(t)}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors",
                i > 0 && "border-l border-foreground/10",
                newSession === t
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-muted-foreground"
              )}
            >
              {t === "group" ? (
                <Users className="h-3.5 w-3.5" />
              ) : (
                <Video className="h-3.5 w-3.5" />
              )}
              {t === "1:1" ? "1-on-1" : "Group"}
            </button>
          ))}
        </div>
      </div>

      {/* Date */}
      <div>
        <Label className="text-xs text-muted-foreground mb-1.5 block">
          Date
        </Label>
        <Input
          type="date"
          value={newDate}
          min={moment(today).format("YYYY-MM-DD")}
          onChange={(e) => {
            onDateChange(e.target.value)
            if (e.target.value) onRepeatEndChange(endOfMonth(e.target.value))
          }}
        />
      </div>

      {/* Start / End */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">
            Start
          </Label>
          <Input
            type="time"
            value={newStart}
            onChange={(e) => {
              onStartChange(e.target.value)
              onClearSlotError()
            }}
            className={cn(slotError && "border-destructive")}
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">
            End
          </Label>
          <Input
            type="time"
            value={newEnd}
            onChange={(e) => {
              onEndChange(e.target.value)
              onClearSlotError()
            }}
            className={cn(slotError && "border-destructive")}
          />
        </div>
      </div>

      {slotError && <p className="text-destructive text-xs">{slotError}</p>}

      {/* Repeat */}
      <div className="flex items-center justify-between rounded-lg border border-foreground/8 px-3 py-2.5">
        <div className="flex items-center gap-2.5 text-sm">
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
          <span>Repeat</span>
        </div>
        <div className="flex rounded-md border border-foreground/10 overflow-hidden">
          {(["none", "daily", "weekly"] as RepeatType[]).map((r, i) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                onRepeatChange(r)
                onClearSlotError()
              }}
              className={toggleItemCls(newRepeat === r, i === 0, "px-2.5 py-1")}
            >
              {r === "none" ? "None" : r === "daily" ? "Daily" : "Weekly"}
            </button>
          ))}
        </div>
      </div>

      {/* Day-of-week picker */}
      {newRepeat === "weekly" && (
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">
            Repeat on
          </Label>
          <div className="flex flex-wrap gap-1.5">
            {DAY_HEADERS.map((label, dow) => {
              const active = newRepeatDays.includes(dow)
              return (
                <button
                  key={dow}
                  type="button"
                  onClick={() => {
                    onClearSlotError()
                    onRepeatDaysChange((prev) =>
                      prev.includes(dow)
                        ? prev.filter((d) => d !== dow)
                        : [...prev, dow]
                    )
                  }}
                  className={cn(
                    "flex-1 min-w-[36px] py-1.5 text-[11px] font-semibold rounded-md border transition-colors",
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-foreground/10 text-muted-foreground hover:bg-muted"
                  )}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Repeat until */}
      {newRepeat !== "none" && (
        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">
            Repeat until <span className="opacity-60">(optional)</span>
          </Label>
          <Input
            type="date"
            value={newRepeatEnd}
            min={newDate}
            onChange={(e) => onRepeatEndChange(e.target.value)}
          />
        </div>
      )}
    </>
  )
}
