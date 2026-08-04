import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { getUserRole } from "@/src/utils/helpers"
import { SessionRequestsScreen } from "@/src/components/Dashboard/profile/SessionRequestsScreen"

export default async function SessionRequestsPage() {
  const user = await AuthUserAction()
  if (!user) redirect("/sign-in")

  if (!getUserRole(user)?.includes("Mentor")) redirect("/profile")

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-foreground/5 shrink-0">
        <Link
          href="/profile"
          className="inline-flex items-center justify-center size-8 rounded-lg border border-transparent hover:bg-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-sm font-semibold">Session Requests</h1>
          <p className="text-xs text-muted-foreground">
            Review incoming mentorship session requests
          </p>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <SessionRequestsScreen mentorId={user.unique_id} />
      </div>
    </div>
  )
}
