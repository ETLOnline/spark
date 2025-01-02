import ProfileScreen from "@/src/components/Dashboard/profile/ProfileScreen"
import { Suspense } from "react"

interface ProfilePageProps {
  searchParams: {
    tab?: string
  }
}

const ProfilePage: React.FC<ProfilePageProps> = ({ searchParams: { tab } }) => {
  return (
    <Suspense>
      <ProfileScreen tab={tab} />
    </Suspense>
  )
}

export default ProfilePage
