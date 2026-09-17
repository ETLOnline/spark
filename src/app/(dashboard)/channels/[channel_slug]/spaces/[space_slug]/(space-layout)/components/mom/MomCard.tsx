"use client"

import moment from "moment"
import {
  CalendarDays,
  CheckSquare,
  Clock,
  ListTodo,
  MoreVertical,
  Pencil,
  Square,
  Trash2,
  Users
} from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu"
import { SelectMom } from "@/src/db/schema"
import { formatDate } from "@/src/components/Dashboard/ProjectManagement/ProjectOverView/utils/Helper"

function formatMeetingTime(time: string) {
  return moment(time, "HH:mm").isValid()
    ? moment(time, "HH:mm").format("h:mm A")
    : time
}

function MomCard({
  mom,
  participantNameById,
  onEdit,
  onDelete
}: {
  mom: SelectMom
  participantNameById: Record<string, string>
  onEdit: () => void
  onDelete: () => void
}) {
  const completed = mom.action_items.filter((a) => a.done).length
  const total = mom.action_items.length

  return (
    <div className="rounded-xl border bg-card p-4 sm:p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            <CalendarDays className="h-4 w-4 text-primary" />
            {formatDate(mom.meeting_date)}
          </span>
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {formatMeetingTime(mom.meeting_start_time)} –{" "}
            {formatMeetingTime(mom.meeting_end_time)}
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground cursor-pointer shrink-0"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem className="cursor-pointer" onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {mom.participants.length > 0 && (
        <div className="flex items-start gap-1.5">
          <Users className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
          <div className="flex flex-wrap gap-1.5">
            {mom.participants.map((id) => (
              <Badge key={id} variant="secondary" className="text-xs">
                {participantNameById[id] ?? id}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
        {mom.discussion_summary}
      </p>

      {total > 0 && (
        <div className="space-y-1.5 pt-1 border-t">
          <div className="flex items-center justify-between pt-3">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <ListTodo className="h-3.5 w-3.5" />
              Action Items
            </span>
            <span className="text-xs text-muted-foreground">
              {completed}/{total} done
            </span>
          </div>
          <ul className="space-y-1">
            {mom.action_items.map((item) => (
              <li key={item.id} className="flex items-start gap-2 text-sm">
                {item.done ? (
                  <CheckSquare className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <Square className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                )}
                <span
                  className={
                    item.done
                      ? "line-through text-muted-foreground"
                      : "text-foreground/90"
                  }
                >
                  {item.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default MomCard
