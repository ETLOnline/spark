import Footer from '@/src/components/HomeLayoutComponents/FooterComponent'
import Header from '@/src/components/HomeLayoutComponents/HeaderComponent'
import React, { ReactNode } from 'react'
import './style.css'




const PublicLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <Header />
        <div className="content">
          {children}
        </div>
      <Footer />

    </>
  )
}

export default PublicLayout