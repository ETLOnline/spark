import React from 'react'
import './footer.css'
import Link from 'next/link'
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react'
import { Separator } from '@/src/components/ui/separator'
import Navbar from '../NavBar/navbar'

function Footer() {
    return (
        <>
            <div className='footer'>

                <Navbar />
                <div className="social-icons">
                    <Link href={'#'}><Linkedin /></Link>
                    <Link href={'#'}><Facebook /></Link>
                    <Link href={'#'}><Instagram /></Link>
                    <Link href={'#'}><Twitter /></Link>
                </div>
            </div>
            <div className=" bg-[#1C2D56] text-white px-8">
                <Separator />
                <div className="flex flex-row justify-between text-sm mt-1 pb-4">
                    <p>@2022 TheLearningDoa. All Right Reserved</p>
                    <p>Term & Conditions   Privacy Policy</p>
                </div>
            </div>




        </>
    )
}

export default Footer