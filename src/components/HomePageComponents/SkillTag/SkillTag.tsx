import React, { ReactNode } from 'react'
import './SkillTag.css'

interface CardProps {
  imgURL: string
  imgALT?: string
  title: ReactNode
}

const SkillTag = ({ imgURL, imgALT, title }: CardProps) => {

  return (
    <div className="skill-tag">
      <img className="icon" src={imgURL} alt={imgALT} />
      <h1 className="font-bold">{title}</h1>
    </div>
  )
}

export default SkillTag