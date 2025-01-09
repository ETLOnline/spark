import React, { ReactNode } from 'react'
import { Heart } from 'lucide-react'
import './MentorCard.css'
import Image from 'next/image'

interface MentorCardprops {
  imgURL: string
  imgALT: string
  title: ReactNode
  duration: ReactNode
}

const MentorCard = ({ imgURL, title, duration, imgALT }: MentorCardprops) => {
  return (
    <div className="Card">
      <Image width={500} height={500} className="card-image" src={imgURL} alt={imgALT} />

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