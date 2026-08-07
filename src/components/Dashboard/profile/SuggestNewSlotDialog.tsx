"use client"

import { useEffect, useState } from "react"
import moment from "moment-timezone"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { Textarea } from "@/src/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  GetMentorSuggestableSlotsAction,
  SuggestNewSlotAction,
  type SlotOccurrence
} from "@/src/server-actions/Mentor/MentorActions"
import { toast } from "@/src/hooks/use-toast"
import { cn } from "@/src/lib/utils"
import { SelectSessionRequest } from "@/src/db/schema"

function formatOccurrence(occ: SlotOccurrence) {
  const date = moment(occ.displayDate, "YYYY-MM-DD").format("ddd, MMM D, YYYY")
  const start = moment(occ.start_time, "HH:mm").format("h:mm A")
  const end = moment(occ.end_time, "HH:mm").format("h:mm A")
  return `${date} · ${start} – ${end}`
}

/** "Mon, Aug 10, 2026 · 3:00 PM – 4:00 PM" for the original requested slot. */
function formatRequestedSlot(request: SelectSessionRequest) {
  const date = moment(request.session_date, "YYYY-MM-DD").format(
    "ddd, MMM D, YYYY"
  )
  const start = moment(request.start_time, "HH:mm").format("h:mm A")
  const end = moment(request.end_time, "HH:mm").format("h:mm A")
  return `${date} · ${start} – ${end}`
}

/** Minimal mentee identity — present when the caller has it joined onto the
 * request (e.g. the inbox screen or the mentor's own pending-requests list),
 * absent otherwise. Used purely to show the mentor who they're suggesting to. */
export type RequestWithOptionalMentee = SelectSessionRequest & {
  mentee?: {
    first_name: string
    last_name: string
    profile_url?: string | null
  } | null
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  request: RequestWithOptionalMentee | null
  mentorId: string
  onSuggested: (requestId: number) => void
}

/** Lets a mentor pick one or more of their other available slots to suggest
 * to a mentee for a given pending session request. */
export default function SuggestNewSlotDialog({
  open,
  onOpenChange,
  request,
  mentorId,
  onSuggested
}: Props) {
  const [slotOccurrences, setSlotOccurrences] = useState<SlotOccurrence[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedOccurrenceKeys, setSelectedOccurrenceKeys] = useState<
    string[]
  >([])
  const [suggestionMessage, setSuggestionMessage] = useState("")

  const [, , , getSuggestableSlots] = useServerAction(
    GetMentorSuggestableSlotsAction
  )
  const [suggesting, , , suggestNewSlot] = useServerAction(SuggestNewSlotAction)

  useEffect(() => {
    if (!open || !request) return
    setSelectedOccurrenceKeys([])
    setSuggestionMessage("")
    setLoadingSlots(true)
    const fetchSlots = async () => {
      const res = await getSuggestableSlots({
        mentorId,
        afterDate: request.session_date
      })
      if (res?.success && res.data) {
        setSlotOccurrences(res.data as SlotOccurrence[])
      }
      setLoadingSlots(false)
    }
    fetchSlots()
  }, [open, request?.id])

  const handleOccurrenceToggle = (key: string) => {
    setSelectedOccurrenceKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const handleSuggestSubmit = async () => {
    if (!request || selectedOccurrenceKeys.length === 0) return
    const res = await suggestNewSlot({
      requestId: request.id,
      slotIds: selectedOccurrenceKeys,
      suggestionMessage: suggestionMessage.trim() || undefined
    })
    if (res?.success) {
      onOpenChange(false)
      toast({ title: "Suggestion sent to mentee", duration: 3000 })
      onSuggested(request.id)
    } else {
      toast({
        variant: "destructive",
        title: "Failed to send suggestion",
        description: res?.error ?? "Please try again.",
        duration: 3000
      })
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onOpenChange(false)
          setSelectedOccurrenceKeys([])
          setSuggestionMessage("")
        }
      }}
    >
      <DialogContent className="sm:max-w-[440px] max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Suggest New Slot</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {request && (
            <div className="flex items-center gap-3 rounded-md border border-foreground/10 bg-foreground/[0.02] px-3 py-2.5">
              {request.mentee && (
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={request.mentee.profile_url || ""} />
                  <AvatarFallback>{request.mentee.first_name}</AvatarFallback>
                </Avatar>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {request.mentee
                    ? `${request.mentee.first_name} ${request.mentee.last_name}`
                    : "Pending request"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {request.topic}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Requested: {formatRequestedSlot(request)}
                </p>
              </div>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Select one or more of your available slots to suggest to the mentee.
          </p>

          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
            {loadingSlots && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Loading slots…
              </p>
            )}
            {!loadingSlots && slotOccurrences.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No available slots after the requested date.
              </p>
            )}
            {slotOccurrences.map((occ) => {
              const selected = selectedOccurrenceKeys.includes(occ.key)
              return (
                <button
                  key={occ.key}
                  onClick={() => handleOccurrenceToggle(occ.key)}
                  className={cn(
                    "flex items-center gap-3 text-left px-3 py-2.5 rounded-md border text-sm transition-colors",
                    selected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-foreground/10 hover:bg-foreground/[0.03]"
                  )}
                >
                  <div
                    className={cn(
                      "h-4 w-4 rounded border shrink-0 flex items-center justify-center",
                      selected
                        ? "border-primary bg-primary"
                        : "border-foreground/30"
                    )}
                  >
                    {selected && (
                      <svg
                        className="h-2.5 w-2.5 text-primary-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{formatOccurrence(occ)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {occ.session_type === "group" ? "Group" : "1-on-1"}
                      {occ.repeat_type !== "none" && ` · ${occ.repeat_type}`}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {slotOccurrences.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">
                Message <span className="text-foreground/40">(optional)</span>
              </p>
              <Textarea
                placeholder="e.g. This slot is taken, please choose from the options below."
                value={suggestionMessage}
                onChange={(e) => setSuggestionMessage(e.target.value)}
                rows={3}
                className="resize-none text-sm"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={suggesting}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              loading={suggesting}
              disabled={selectedOccurrenceKeys.length === 0}
              onClick={handleSuggestSubmit}
            >
              Send Suggestion
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
