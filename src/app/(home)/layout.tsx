import Footer from '@/src/components/HomeLayoutComponents/FooterComponent'
import Header from '@/src/components/HomeLayoutComponents/HeaderComponent'
import React, { ReactNode } from 'react'




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