import React, { ReactNode } from 'react'
import './SkillTag.css'

interface CardProps {
  imgURL: string
  imgALT?: string
  title: ReactNode
}

const SkillTag = ({ imgURL, imgALT, title }: CardProps) => {

  return (
    <div className="skill-tag m-2">
      <img className="icon" src={imgURL} alt={imgALT} />
      <h3 className="font-bold">{title}</h3>
    </div>
  )
}

export default SkillTag