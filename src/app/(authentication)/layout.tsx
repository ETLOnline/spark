import { ScrollArea } from '@/src/components/ui/scroll-area'
import React, { ReactNode } from 'react'

const Authticationlayout = ({ children }: { children: ReactNode }) => {
	return (
		<div className='flex flex-row md:items-center w-full'>
			<div className='w-full fixed md:relative md:w-1/2 '>
				<img className='w-full object-cover h-screen md:h-full md:fixed md:top-0 md:w-1/2' src="/images/home/image.jpg" alt="signup-image" />
			</div>
			<div className='absolute w-full h-full flex justify-around md:grid grid-cols-12  md:w-1/2 md:relative 	'>
				<div className='col-start-2 col-span-8 md:col-start-2 md:col-span-10 flex justify-center items-center h-full' >
					{children}
				</div>
			</div>
		</div>
	)
}

export default Authticationlayout