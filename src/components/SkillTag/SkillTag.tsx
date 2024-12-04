import React, { ReactNode } from 'react'
import './SkillTag.css'

interface cardprops {
  imgURL: string
  imgALT: string
  title: ReactNode
}

const LogoCards = ({ imgURL, imgALT, title }: cardprops) => {

  return (
    <div className="SkillTag">
      <img className="Icon" src={imgURL} alt={imgALT} />
      <h1 className="font-bold">{title}</h1>
    </div>
  )
}

export default LogoCards