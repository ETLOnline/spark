import Link from 'next/link'
import React, { ReactNode } from 'react'
import './home-layout.css'
import { LinkAsButton } from '@/src/components/LinkAsButton/LinkAsButton'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'

const PublicLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <div className="header">

      
        <div className='header-nav'>

          <Link className='nav-brand' href="#">Spark</Link>

          <ul className='nav'>
            <li className='nav-items'>
              <Link className='nav-link' href="/dashboard">
                Dashboard</Link>
            </li>
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
          <SignedIn>
            <UserButton userProfileUrl='/profile'/>
          </SignedIn>
          <SignedOut>
            <LinkAsButton href='/sign-up' className='button' variant={'ghost'}>Sign Up</LinkAsButton>
            <LinkAsButton href='/sign-in' variant={'default'}>Log In</LinkAsButton>
          </SignedOut>
        </div>

      </div>
      
      {children}
      <div>footer</div>
    </>
  )
}

export default PublicLayout