import Link from 'next/link'
import React from 'react'
import './navbar.css'

function Navbar() {
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

export default Navbar