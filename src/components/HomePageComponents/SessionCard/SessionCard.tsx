import React, { ReactNode } from 'react'
import './SessionCard.css'
import Image from 'next/image'

interface sessioncardprops {
  imgURL: string
  imgALT?: string
  title: ReactNode
}

const SessionCard = ({ imgURL, title, imgALT }: sessioncardprops) => {
  return (
    <div className="session-card">
      <div className="Image-container">
        <Image layout='fill' objectFit='cover' className="session-card-image" src={imgURL} alt='Sessions-Image' />
      </div>
      <div className="session-card-content">
        <div className="flex flex-wrap justify-between">
          <p className=" session-card-text text-sm">200+ Attendes</p>
          <p className="session-card-text text-sm">6/11/2022-3pm</p>
        </div>
        <h3 className="text-base md:text-lg">{title}</h3>
        <div className="flex flex-wrap gap-2">
          <div className="relative h-8 w-8">
            <Image layout='fill' objectFit='cover' src="/images/home/mentor-image4.jpg" className='w-8 h-8 rounded-full object-cover ' alt="" />
          </div>
          <p className="mt-1 session-card-text">James Dean</p>
        </div>
      </div>
    </div>
  )
}

export default SessionCard