"use client"

import Link from "next/link"
import { CheckCircle2, Clock, Lock, Users, Video, X } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/src/components/ui/tooltip"
import { RP_THRESHOLD } from "@/src/utils/constants"
import { SelectMentorAvailability, SelectSessionRequest } from "@/src/db/schema"
import {
  countOverlappingRequests,
  formatTime,
  getStartTimeOptions,
  getUnavailableRangesForRequest,
  isSlotFullyBooked,
  myAcceptedRequestsFor,
  myPendingRequestFor,
  othersBookedRequestsFor,
  repeatLabel
} from "./mentorCalendarUtils"

interface SlotListItemProps {
  slot: SelectMentorAvailability
  isMyProfile: boolean
  selectedDate: Date
  myRequests: SelectSessionRequest[]
  bookedRequests: SelectSessionRequest[]
  mentorPendingRequests: SelectSessionRequest[]
  mentorAcceptedRequests: SelectSessionRequest[]
  viewerRp: number
  pendingDeleteId: number | null
  onTogglePendingDelete: (slotId: number | null) => void
  onDeleteSeries: (slotId: number) => void
  onDeleteOccurrence: (slotId: number, date: Date) => void
  onRequestSlot: (slot: SelectMentorAvailability) => void
}

export function SlotListItem({
  slot,
  isMyProfile,
  selectedDate,
  myRequests,
  bookedRequests,
  mentorPendingRequests,
  mentorAcceptedRequests,
  viewerRp,
  pendingDeleteId,
  onTogglePendingDelete,
  onDeleteSeries,
  onDeleteOccurrence,
  onRequestSlot
}: SlotListItemProps) {
  const mentorPendingCount = isMyProfile
    ? countOverlappingRequests(slot, selectedDate, mentorPendingRequests)
    : 0
  const mentorAcceptedCount = isMyProfile
    ? countOverlappingRequests(slot, selectedDate, mentorAcceptedRequests)
    : 0
  return (
    <div className="rounded-lg border border-foreground/8 text-sm overflow-hidden">
      {/* Slot info row */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          {slot.session_type === "group" ? (
            <Users className="h-4 w-4 text-muted-foreground shrink-0" />
          ) : (
            <Video className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          <div className="min-w-0">
            <p className="truncate">
              {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
            </p>
            <p className="text-xs text-muted-foreground">{repeatLabel(slot)}</p>
          </div>
          <span className="text-xs text-muted-foreground border border-foreground/10 rounded px-1.5 py-0.5 shrink-0">
            {slot.session_type === "group" ? "Group" : "1-on-1"}
          </span>
        </div>
        {isMyProfile && (
          <button
            onClick={() => {
              if (slot.repeat_type === "none") {
                onDeleteSeries(slot.id)
              } else {
                onTogglePendingDelete(
                  pendingDeleteId === slot.id ? null : slot.id
                )
              }
            }}
            className="h-6 w-6 flex items-center justify-center shrink-0 rounded text-destructive hover:bg-destructive/10 transition-colors ml-2"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Mentor's own view: activity from all mentees, linking to the inbox to act on it */}
      {isMyProfile && (mentorPendingCount > 0 || mentorAcceptedCount > 0) && (
        <Link
          href="/profile/session-requests"
          className="flex items-center gap-3 px-3 py-2 border-t border-foreground/8 text-xs hover:bg-foreground/[0.02] transition-colors"
        >
          {mentorPendingCount > 0 && (
            <span className="flex items-center gap-1 text-amber-600 font-medium">
              <Clock className="h-3 w-3" />
              {mentorPendingCount} pending
            </span>
          )}
          {mentorAcceptedCount > 0 && (
            <span className="flex items-center gap-1 text-emerald-500 font-medium">
              <CheckCircle2 className="h-3 w-3" />
              {mentorAcceptedCount} confirmed
            </span>
          )}
        </Link>
      )}

      {/* Confirmed sessions THIS mentee already has here */}
      {!isMyProfile &&
        myAcceptedRequestsFor(slot, selectedDate, myRequests).map((r) => (
          <div
            key={r.id}
            className="flex items-center gap-1.5 px-3 py-2 border-t border-foreground/8 text-xs text-emerald-500 font-medium"
          >
            <CheckCircle2 className="h-3 w-3 shrink-0" />
            Booked {formatTime(r.start_time)} – {formatTime(r.end_time)}
          </div>
        ))}

      {/* Hours already taken by other mentees */}
      {!isMyProfile &&
        othersBookedRequestsFor(
          slot,
          selectedDate,
          myRequests,
          bookedRequests
        ).map((r) => (
          <div
            key={r.id}
            className="flex items-center gap-1.5 px-3 py-2 border-t border-foreground/8 text-xs text-muted-foreground font-medium"
          >
            <Lock className="h-3 w-3 shrink-0" />
            {formatTime(r.start_time)} – {formatTime(r.end_time)} Booked
          </div>
        ))}

      {/* Request action — viewer only */}
      {!isMyProfile &&
        (isSlotFullyBooked(slot, selectedDate, bookedRequests) ? (
          <div className="flex items-center gap-1.5 px-3 py-2 border-t border-foreground/8 text-xs text-muted-foreground font-medium">
            <Lock className="h-3 w-3" />
            Booked
          </div>
        ) : myAcceptedRequestsFor(slot, selectedDate, myRequests).length >
          0 ? null : myPendingRequestFor(slot, selectedDate, myRequests) ? (
          <div className="flex items-center gap-1.5 px-3 py-2 border-t border-foreground/8 text-xs text-amber-600 font-medium">
            <Clock className="h-3 w-3" />
            Request pending
          </div>
        ) : getStartTimeOptions(
            slot,
            getUnavailableRangesForRequest(
              slot,
              selectedDate,
              myRequests,
              bookedRequests
            )
          ).length === 0 ? (
          <div className="flex items-center gap-1.5 px-3 py-2 border-t border-foreground/8 text-xs text-muted-foreground font-medium">
            <Clock className="h-3 w-3" />
            This time has passed
          </div>
        ) : viewerRp < RP_THRESHOLD ? (
          <div className="px-3 py-2 border-t border-foreground/8">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="w-full inline-block">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      className="w-full pointer-events-none opacity-50"
                    >
                      Request this Slot
                    </Button>
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Earn {RP_THRESHOLD - viewerRp} more RP to request a session
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ) : (
          <div className="px-3 py-2 border-t border-foreground/8">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.currentTarget.blur()
                onRequestSlot(slot)
              }}
            >
              Request this Slot
            </Button>
          </div>
        ))}

      {/* Inline delete confirmation — only for recurring slots */}
      {isMyProfile && pendingDeleteId === slot.id && (
        <div className="flex items-center gap-2 px-3 py-2 border-t border-foreground/8 bg-destructive/5">
          <p className="text-xs text-muted-foreground flex-1">Remove:</p>
          <button
            onClick={() => onDeleteOccurrence(slot.id, selectedDate)}
            className="text-xs px-2 py-1 rounded border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors whitespace-nowrap"
          >
            This date
          </button>
          <button
            onClick={() => onDeleteSeries(slot.id)}
            className="text-xs px-2 py-1 rounded bg-destructive text-destructive-foreground hover:bg-destructive/80 transition-colors whitespace-nowrap"
          >
            All dates
          </button>
          <button
            onClick={() => onTogglePendingDelete(null)}
            className="h-5 w-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  )
}
