import React, { ReactNode } from 'react'
import './sessioncard.css'

interface sessioncardprops {
  imgURL: string
  title: ReactNode
}

const SessionCard = ({ imgURL, title }: sessioncardprops) => {
  return (
    <div className="sessioncard">
      <img className="cardimage" src={imgURL} alt="" />
      <div className="cardcontent">
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