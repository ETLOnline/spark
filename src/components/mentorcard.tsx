import React, { ReactNode } from 'react'
import { Heart } from 'lucide-react'

interface mentorcardprops{
    imgURL: string
    Tittle: ReactNode
    Duration: ReactNode
}

const MentorCard = ({imgURL , Tittle , Duration}:mentorcardprops)=> {
  return (
    <div className="relative h-[300px] w-[250px] overflow-hidden rounded-xl bg-white">
    <img className="h-auto w-auto object-contain" src={imgURL} alt="" />

    <div className="absolute left-0 top-0 flex h-full w-full flex-col justify-between bg-gradient-to-t from-black opacity-45">
      <div className="flex justify-end mr-2 mt-2 h-10 text-white "><Heart /></div>
      <div className="flex justify-between h-10  mx-2">
        <h1 className="text-white">{Tittle}</h1>
        <p className="text-white">{Duration}</p>
      </div>
    </div>
  </div>
  )
}

export default MentorCard