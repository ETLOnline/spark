import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { MentorCalendar } from "./MentorCalendar"

interface AvailabilityPageShellProps {
  backHref: string
  title: string
  subtitle: string
  userId: string
  isMyProfile: boolean
}

export function AvailabilityPageShell({
  backHref,
  title,
  subtitle,
  userId,
  isMyProfile
}: AvailabilityPageShellProps) {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-foreground/5 shrink-0">
        <Link
          href={backHref}
          className="inline-flex items-center justify-center size-8 rounded-lg border border-transparent hover:bg-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-sm font-semibold">{title}</h1>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <MentorCalendar userId={userId} isMyProfile={isMyProfile} />
      </div>
    </div>
  )
}
