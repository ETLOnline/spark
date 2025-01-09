import React, { ReactNode } from 'react'
import './SkillTag.css'
import Image from 'next/image'

interface CardProps {
  imgURL: string
  imgALT: string
  title: ReactNode
}

const SkillTag = ({ imgURL, title, imgALT }: CardProps) => {

  return (
    <div className="skill-tag m-2">
      <Image width={500} height={500} className="icon" src={imgURL} alt={imgALT} />
      <h3 className="font-bold">{title}</h3>
    </div>
  )
}

export default SkillTag