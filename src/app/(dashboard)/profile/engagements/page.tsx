import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { EngagementListingScreen } from "@/src/components/Dashboard/profile/engagements/EngagementListingScreen"

export default function EngagementsPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-foreground/5 shrink-0">
        <Link
          href="/profile"
          className="inline-flex items-center justify-center size-8 rounded-lg border border-transparent hover:bg-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-sm font-semibold">My Engagements</h1>
          <p className="text-xs text-muted-foreground">
            Track and manage your mentorship sessions
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0">
        <EngagementListingScreen />
      </div>
    </div>
  )
}
