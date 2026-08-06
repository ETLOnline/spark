"use client"

import { useEffect, useState } from "react"
import moment from "moment-timezone"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { cn } from "@/src/lib/utils"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetAcceptedSessionRequestsForMentorOnDateAction } from "@/src/server-actions/Mentor/MentorActions"
import { MentorSessionRequest } from "./MentorSessionsCard"
import { ViewSpaceButton } from "./ViewSpaceButton"
import { SessionTypeIcon } from "./SessionTypeIcon"
import Loader from "../../common/Loader/Loader"
import { LoaderSizes } from "../../common/types/loader-types"

interface Props {
  mentorId: string
}

function counterpartLabel(request: MentorSessionRequest) {
  if (request.session_type === "group") return "Group session"
  const name =
    `${request.mentee?.first_name ?? ""} ${request.mentee?.last_name ?? ""}`.trim()
  return name || "1-on-1 session"
}

function SessionCard({ request }: { request: MentorSessionRequest }) {
  return (
    <div className="rounded-xl bg-foreground/[0.03] border border-foreground/5 px-4 py-3.5 flex items-start gap-3">
      <SessionTypeIcon sessionType={request.session_type} />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground">
          {moment(request.start_time, "HH:mm").format("h:mm A")} –{" "}
          {moment(request.end_time, "HH:mm").format("h:mm A")}
        </p>
        <p className="text-base font-semibold mt-0.5 truncate">
          {request.topic}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {counterpartLabel(request)}
        </p>
      </div>
      <ViewSpaceButton spaceSlug={request.space?.space_slug} />
    </div>
  )
}

export function BookedSlotsScreen({ mentorId }: Props) {
  const [selectedDate, setSelectedDate] = useState(() =>
    moment().startOf("day")
  )
  const [loading, setLoading] = useState(true)
  const [sessions, setSessions] = useState<MentorSessionRequest[]>([])
  const [, , , getSessionsForDate] = useServerAction(
    GetAcceptedSessionRequestsForMentorOnDateAction
  )

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      const res = await getSessionsForDate(
        mentorId,
        selectedDate.format("YYYY-MM-DD")
      )
      if (!cancelled && res?.success && res.data) {
        setSessions(res.data)
      }
      if (!cancelled) setLoading(false)
    }
    load()
    return () => {
      cancelled = true
    }
  }, [mentorId, selectedDate])

  const weekStart = selectedDate.clone().startOf("week")
  const weekDays = Array.from({ length: 7 }, (_, i) =>
    weekStart.clone().add(i, "days")
  )

  return (
    <div className="p-4 max-w-3xl mx-auto w-full">
      <div className="flex items-center justify-between gap-2 mb-5">
        <div className="flex items-center gap-2 min-w-0">
          <CalendarDays className="h-5 w-5 text-muted-foreground shrink-0" />
          <h2 className="text-base sm:text-lg font-semibold truncate">
            {selectedDate.format("ddd, MMM D, YYYY")}
          </h2>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setSelectedDate((d) => d.clone().subtract(1, "day"))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Full week strip — needs more room than a phone screen has, so it
           * only shows from `sm:` up; smaller screens fall back to the
           * prev/next arrows alone for day-by-day navigation. */}
          <div className="hidden sm:flex items-center gap-1">
            {weekDays.map((day) => {
              const isSelected = day.isSame(selectedDate, "day")
              return (
                <button
                  key={day.format("YYYY-MM-DD")}
                  onClick={() => setSelectedDate(day.clone())}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 h-14 w-11 rounded-2xl text-xs shrink-0 transition-colors",
                    isSelected
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:bg-foreground/5"
                  )}
                >
                  <span className="text-[10px] uppercase tracking-wide">
                    {day.format("ddd")}
                  </span>
                  <span className="text-sm">{day.format("D")}</span>
                </button>
              )
            })}
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setSelectedDate((d) => d.clone().add(1, "day"))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader size={LoaderSizes.md} />
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border border-dashed border-foreground/10">
          <CalendarDays className="h-8 w-8 text-muted-foreground mb-3" />
          <p className="text-sm font-medium">No sessions scheduled</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Scheduled
          </p>
          {sessions.map((request) => (
            <SessionCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  )
}
