import Link from 'next/link'
import React from 'react'
import './navbar.css'
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet'
import { Button } from '../ui/button'
import { HamIcon, Menu } from 'lucide-react'

function Navbar() {

    const NavbarItems = () => {
        return (
            <div className='navbar'>

                <Link className='nav-brand' href="#">Spark</Link>

                <ul className='nav'>
                    <li className='nav-item'>
                        <Link className='nav-link' href="/dashboard">
                            Dashboard</Link>
                    </li>
                    <li className='nav-item'>
                        <Link className='nav-link' href="#">
                            Find a Mentor</Link>
                    </li>
                    <li className='nav-item'>
                        <Link className='nav-link' href="#">
                            About Us</Link>
                    </li>
                    <li className='nav-item'>
                        <Link className='nav-link' href="#">
                            Pricing</Link>
                    </li>
                    <li className='nav-item'>
                        <Link className='nav-link' href="#">
                            Become a Member</Link>
                    </li>
                </ul>
            </div>

        )
    }

    return (
        <>
            <div className="hidden md:hidden lg:block">
                {NavbarItems()}
            </div>

            <Sheet>
                <SheetTrigger className='block lg:hidden'>
                    <Menu />
                </SheetTrigger>
                <SheetContent side={'left'}>
                    {NavbarItems()}
                </SheetContent>
            </Sheet>
        </>
    )
}

export default Navbar