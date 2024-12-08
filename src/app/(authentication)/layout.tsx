import React, { ReactNode } from 'react'

const Authticationlayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className='flex flex-row h-screen w-full '>
            <div className='w-full relative md:w-1/2 '>
                <img className='h-full w-full object-cover' src="/images/home/image.jpg" alt="signup-image" />
            </div>
            <div className='absolute w-full h-full grid grid-cols-12  items-center md:w-1/2 md:relative '>
                <div className='col-start-3 col-span-8 md:col-start-2 md:col-span-10 '>
                    <div className=' md:flex md:flex-col items-center justify-center'>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Authticationlayout