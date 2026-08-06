import { User, Users } from "lucide-react"

interface Props {
  sessionType: string
}

/** Consistent session-type glyph — single-person icon for 1-on-1, multi-person
 * icon for group, so the two only ever differ by head count, not icon family. */
export function SessionTypeIcon({ sessionType }: Props) {
  return (
    <div className="h-9 w-9 rounded-md bg-primary/15 flex items-center justify-center shrink-0">
      {sessionType === "group" ? (
        <Users className="h-4 w-4 text-primary" />
      ) : (
        <User className="h-4 w-4 text-primary" />
      )}
    </div>
  )
}
