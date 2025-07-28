import ProfileCompletionForm from "@/src/components/ProfileCompletion/ProfileCompletionForm"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { isSuperAdmin } from "@/src/utils/helpers"
import { redirect } from "next/navigation"
import React from "react"

async function ProfileData() {
  const user = await AuthUserAction()
  const superAdmin = await isSuperAdmin(user)

  if (!superAdmin) {
    if (user.profile && user.profile.bio && user.profile.degree) {
      redirect("/profile")
    }
  }

  return (
    <div className="py-8 max-w-3xl mx-auto mt-14">
      <ProfileCompletionForm />
    </div>
  )
}

export default ProfileData
