import React, { ReactNode } from 'react'

const DashboardLayout = ({children}:{children:ReactNode}) => {
  return (
    <>
        <div>header</div>
        <div>
            <div>side bar</div>
            <div>{children}</div>
        </div>
        <div>footer</div>
    </>
  )
}

export default DashboardLayout