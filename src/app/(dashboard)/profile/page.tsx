import ProfileScreen from "@/src/components/Dashboard/profile/ProfileScreen"
import { SelectUser } from "@/src/db/schema"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { GetUserProfileAction } from "@/src/server-actions/User/User"
import { Suspense } from "react"
import { Profile } from "@/src/components/Dashboard/profile/types/profile-types"

interface ProfilePageProps {
  searchParams: Promise<{
    tab?: string
  }>
}

const ProfilePage: React.FC<ProfilePageProps> = async (props) => {
  const { tab } = await props.searchParams
  
  let user

  let profileData: Profile | undefined

  try {
    user = await AuthUserAction()
    if (user) {
      const res = await GetUserProfileAction(user.unique_id)
      if (res) {
        profileData = res.data
      }
    }
  } catch (error) {
    console.error("Error fetching profile data!", error)
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
