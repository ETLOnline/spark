import ProfileScreen from "@/src/components/Dashboard/profile/ProfileScreen"
import { Suspense } from "react"

interface ProfilePageProps {
  searchParams: Promise<{
    tab?: string
  }>
}

const ProfilePage: React.FC<ProfilePageProps> = async props => {
  const searchParams = await props.searchParams;

  const {
    tab
  } = searchParams;

  return (
    <Suspense>
      <ProfileScreen tab={tab} />
    </Suspense>
  )
}

export default ProfilePage
