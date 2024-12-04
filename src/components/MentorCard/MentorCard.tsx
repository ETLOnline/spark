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
      <img className="card-image" src={imgURL} alt="" />

      <div className="card-content">
        <div className="card-icon"><Heart /></div>
        <div className="card-caption">
          <h1>{title}</h1>
          <p>{duration}</p>
        </div>
      </div>
    </div>
  )
}

export default MentorCard