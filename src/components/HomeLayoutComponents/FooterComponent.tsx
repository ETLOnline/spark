import React from 'react'
import './footer.css'
import Link from 'next/link'
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react'
import { Separator } from '@/src/components/ui/separator'


function Footer() {
    return (
        <div className='footer'>
            <div className='footer-navigation'>

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
                <div className="social-icons justify-center mt-4">
                    <Link href={'#'}><Linkedin /></Link>
                    <Link href={'#'}><Facebook /></Link>
                    <Link href={'#'}><Instagram /></Link>
                    <Link href={'#'}><Twitter /></Link>
                </div>
            </div>
            <div className="footer-bottom">
                <Separator />
                <div className="footer-bottom-text">
                    <p>@2022 TheLearningDoa. All Right Reserved</p>
                    <p>Term & Conditions   Privacy Policy</p>
                </div>
            </div>




        </div>
    )
}

export default Footer