import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { isSuperAdmin } from "@/src/utils/helpers"
import MentorSpacesList from "./components/MentorSpacesList"

interface Props {
  params: Promise<{
    userId: string
  }>
}

export default async function MentorSpacesPage({ params }: Props) {
  const { userId } = await params

  const authUser = await AuthUserAction()
  if (!authUser) redirect("/sign-in")

  const superAdmin = await isSuperAdmin(authUser)
  if (authUser.unique_id !== userId && !superAdmin) {
    redirect("/profile")
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-foreground/5 shrink-0">
        <Link
          href="/profile"
          className="inline-flex items-center justify-center size-8 rounded-lg border border-transparent hover:bg-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-sm font-semibold">Active Spaces</h1>
          <p className="text-xs text-muted-foreground">
            All of your active mentorship spaces
          </p>
        </div>
      </div>

      <div className="flex-1 p-4">
        <MentorSpacesList userId={userId} />
      </div>
    </div>
  )
}
