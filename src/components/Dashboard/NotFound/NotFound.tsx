import React from 'react'
import { LinkAsButton } from '../../LinkAsButton/LinkAsButton'
import Image from 'next/image'

const NotFound = () => {
  return (
    <section className="bg-white dark:bg-gray-900">
      <div className=" px-4 mx-auto max-w-screen-xl lg:px-6">
        <div className="mx-auto max-w-screen-sm text-center ">
          <div className='flex justify-center'>
            <Image src={'/images/404/404error(1).svg'} alt="404 Error" width={300} height={300} className='' />
          </div>
          <p className="mb-4 text-3xl tracking-tight font-semibold text-gray-900  dark:text-white">Oops!</p>
          <p className="mb-4 text-sm font-light text-gray-500 dark:text-gray-400">Sorry, we can't find that page. You'll find lots to explore on the home page. </p>
          <LinkAsButton href="/posts">Back to Homepage</LinkAsButton>
        </div>
      </div>
    </section>
  )
}

export default NotFound