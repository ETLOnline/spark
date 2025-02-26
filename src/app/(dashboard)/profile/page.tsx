import ProfileScreen from "@/src/components/Dashboard/profile/ProfileScreen"
import { SelectUser } from "@/src/db/schema"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { GetUserProfileAction } from "@/src/server-actions/User/User"
import { Suspense } from "react"
import { Profile } from "@/src/components/Dashboard/profile/types/profile-types.d"

interface ProfilePageProps {
  searchParams: {
    tab?: string
  }
}

const ProfilePage: React.FC<ProfilePageProps> = async ({
  searchParams: { tab }
}) => {
  const user = await AuthUserAction()

  let profileData: Profile | undefined

  if (user) {
    const res = await GetUserProfileAction(user.unique_id)
    if (res) {
      profileData = res.data
    }
  }

  return (
    <Suspense>
      <ProfileScreen
        tab={tab}
        user={user as SelectUser}
        profileData={profileData as Profile}
      />
    </Suspense>
  )
}

export default ProfilePage
