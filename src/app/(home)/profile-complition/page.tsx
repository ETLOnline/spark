import ProfileCompletionShell from "@/src/components/ProfileCompletion/ProfileCompletionShell"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { isSuperAdmin } from "@/src/utils/helpers"
import { redirect } from "next/navigation"
import React from "react"

async function ProfileData() {
  const user = await AuthUserAction()
  const superAdmin = await isSuperAdmin(user)
  if (!superAdmin) {
    if (user.profile && user.profile.is_profile_completed === 1) {
      redirect("/profile")
    }
  }

  return (
    <div className="py-8 max-w-3xl mx-auto mt-14">
      <ProfileCompletionShell initialUser={user} />
    </div>
  )
}

export default ProfileData
