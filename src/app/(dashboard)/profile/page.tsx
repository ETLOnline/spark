import ProfileScreen from '@/src/components/Dashboard/profile/ProfileScreen'
import React, { Suspense } from 'react'

const page = () => {
  return (
    <Suspense>
      <ProfileScreen />
    </Suspense>
  )
}

export default page