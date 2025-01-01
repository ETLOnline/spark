import ProfileScreen from '@/src/components/oldDashboard/profile/ProfileScreen'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <Suspense>
      <ProfileScreen />
    </Suspense>
  )
}

export default page