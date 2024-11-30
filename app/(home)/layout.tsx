import Link from 'next/link'
import React, { ReactNode } from 'react'
import './home-layout.css'
import { Button } from '@/components/ui/button'

const PublicLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
    <div className="wrapper">

    
      <div className='Header'>

        <Link className='nav-brand' href="#">Spark</Link>

        <ul className='nav'>
          <li className='nav-items'>
            <Link className='nav-link' href="#">
              Find a Mentor</Link>
          </li>
          <li className='nav-items'>
            <Link className='nav-link' href="#">
              About Us</Link>
          </li>
          <li className='nav-items'>
            <Link className='nav-link' href="#">
              Pricing</Link>
          </li>
          <li className='nav-items'>
            <Link className='nav-link' href="#">
              Become a Member</Link>
          </li>
        </ul>
      </div>

      <div className="button-wrapper">
        <Button className='button' variant={'ghost'}>Sign Up</Button>
        <Button variant={'default'}>Log In</Button>

      </div>

      </div>
      {children}
      <div>footer</div>
    </>
  )
}

export default PublicLayout