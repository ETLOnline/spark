import React from 'react'
import './header.css'
import { LinkAsButton } from '@/src/components/LinkAsButton/LinkAsButton'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import Navbar from '../NavBar/NavbarComponent'
import ModeToggle  from '../ThemeProvider/ThemeToggle'

function Header() {
	return (
		<div className="header">
			<Navbar />
			<div className="button-wrapper">
				<SignedIn>
					<UserButton userProfileUrl='/profile' />
				</SignedIn>
				<SignedOut>
					<LinkAsButton href='/sign-up' className='button' variant={'ghost'}>Sign Up</LinkAsButton>
					<LinkAsButton href='/sign-in' variant={'default'}>Log In</LinkAsButton>
				</SignedOut>
				<ModeToggle />
			</div>
		</div>
	)
}

export default Header