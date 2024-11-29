import React, { ReactNode } from 'react'

const PublicLayout = ({children}:{children:ReactNode}) => {
  return (
    <>
      <div>header</div>
      {children}
      <div>footer</div>
    </>
  )
}

export default PublicLayout