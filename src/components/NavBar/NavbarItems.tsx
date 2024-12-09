import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function Navbaritems() {
	return (
		<div className='navbar'>

			<Link className='nav-brand' href="#">
				<Image width={50} height={50} src="/logo/spark-logo-no-bg.png" alt='Spark logo' />
			</Link>

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

export default Navbaritems