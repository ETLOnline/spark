import React from 'react'
import './footer.css'
import Link from 'next/link'
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react'
import { Separator } from '@/src/components/ui/separator'

function Footer() {
  return (
    <>
    <div className='flex flex-row justify-between px-8 py-16 bg-[#1C2D56] text-white'>

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

<div className="social-icons">
  <Link href={'/'}><Linkedin /></Link>
  <Link href={'/'}><Facebook /></Link>
  <Link href={'/'}><Instagram /></Link>
  <Link href={'/'}><Twitter /></Link>
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