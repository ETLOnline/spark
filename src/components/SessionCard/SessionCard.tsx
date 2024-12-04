import React, { ReactNode } from 'react'
import './sessioncard.css'

interface sessioncardprops {
  imgURL: string
  title: ReactNode
}

const SessionCard = ({ imgURL, title }: sessioncardprops) => {
  return (
    <div className="session-card">
      <img className="w-full md:h-32 lg:h-52 rounded-md" src={imgURL} alt="" />
      <div className="flex flex-col md:gap-1 lg:gap-3 p-3">
        <div className="flex flex-row justify-between">
          <p className="text-sm text-[#8B8B8B]">200+ Attendes</p>
          <p className="text-sm text-[#8B8B8B]">6/11/2022-3pm</p>
        </div>
        <h1 className="text-xl">{title}</h1>
        <div className="flex flex-row gap-2">
          <img src="/mentor-image4.jpg" className='w-8 h-8 rounded-full object-cover ' alt="" />
          <p className="mt-1 text-[#8B8B8B]">James Dean</p>
        </div>
      </div>
    </div>
  )
}

export default SessionCard