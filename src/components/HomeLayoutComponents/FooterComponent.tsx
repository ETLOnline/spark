import React from 'react'
import './footer.css'
import Link from 'next/link'
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react'
import { Separator } from '@/src/components/ui/separator'
import { Input } from '@/src/components/ui/input'
import { Button } from '@/src/components/ui/button'


function Footer() {
	return (
		<div className="footer">

			<div className="footer-content">
				<div className='footer-section'>
					<h2 className='footer-section-title'>About Us</h2>
					<p className='footer-section-text pr-3'>
						Empowering growth through mentorship. Connect learn and succed with our globalcommunity of mentors.
					</p>
				</div>
				<div className="footer-section">
					<h2 className="footer-section-title">Quick Links</h2>
					<ul className="footer-nav">
						<li >
							<Link className='footer-nav-link' href='/'>Home</Link>
						</li>
						<li >
							<Link className='footer-nav-link' href='#'>About</Link>
						</li>
						<li >
							<Link className='footer-nav-link' href='contact-us'>contact</Link>
						</li>
						<li >
							<Link className='footer-nav-link' href='#'>FAQ</Link>
						</li>
					</ul>
				</div>
				<div className="footer-section">
					<h2 className='footer-section-title'>Follow Us</h2>
					<div className="icons ">
						<Link href={'#'}>
							<Facebook />
						</Link>
						<Link href={'#'}>
							<Twitter />
						</Link>
						<Link href={'#'}>
							<Instagram />
						</Link>
						<Link href={'#'} >
							<Linkedin />
						</Link>
					</div>
				</div>
				<div className="footer-section">
					<h2 className='footer-section-title'>Newsletter</h2>
					<p className='footer-section-text'>Stay updated with our latest news and offers</p>
					<form className='input'>
						<Input type='email' className='rounded-r-none' />
						<Button className='mt-4 rounded-l-none'>Subscribe</Button>
					</form>
				</div>
			</div>
			<div className="footer-bottom">
				<Separator />
				<p className='footer-section-text text-center my-4'>2024 Spark. All right reserved</p>
			</div>
		</div>
	)
}

export default Footer