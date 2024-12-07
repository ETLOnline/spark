import Link from 'next/link'
import React from 'react'
import './navbar.css'
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet'
import { Button } from '../ui/button'
import { HamIcon, Menu } from 'lucide-react'
import Navbaritems from './NavbarItem'

function Navbar() {

    return (
        <>
            <div className="hidden md:hidden lg:block">
                <Navbaritems />
            </div>

            <Sheet>
                <SheetTrigger className='block lg:hidden'>
                    <Menu />
                </SheetTrigger>
                <SheetContent side={'left'}>
                    <Navbaritems />
                </SheetContent>
            </Sheet>
        </>
    )
}

export default Navbar