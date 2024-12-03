import React, { ReactNode } from 'react'
import Header from '@/src/components/HomeLayoutComponents/header'
import Footer from '@/src/components/HomeLayoutComponents/footer'


const PublicLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}

export default PublicLayout