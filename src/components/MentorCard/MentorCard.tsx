import React, { ReactNode } from 'react'
import { Heart } from 'lucide-react'
import './MentorCard.css'

interface MentorCardprops {
  imgURL: string
  title: ReactNode
  duration: ReactNode
}

const MentorCard = ({ imgURL, title, duration }: MentorCardprops) => {
  return (
    <div className="Card">
      <img className="CardImage" src={imgURL} alt="" />

      <div className="CardContent">
        <div className="CardIcon"><Heart /></div>
        <div className="CardCaption">
          <h1 className="text-white">{title}</h1>
          <p className="text-white">{duration}</p>
        </div>
      </div>
    </div>
  )
}

export default MentorCard