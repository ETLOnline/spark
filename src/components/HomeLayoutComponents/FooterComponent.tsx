import React from 'react'
import './footer.css'
import Link from 'next/link'
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react'
import { Separator } from '@/src/components/ui/separator'
import Navbaritems from '../NavBar/NAvbarItems'


function Footer() {
    return (
        <div className='footer'>
            <div className='footer-navigation'>

                <Navbaritems />
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