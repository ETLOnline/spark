import React, { ReactNode } from 'react'

interface cardprops{
  imgURL: string
  imgALT: string
  Tittle:ReactNode
}

const LogoCards = ({imgURL , imgALT , Tittle}:cardprops)=> {

  return (
    <div className="flex flex-row gap-1 border-2 rounded-md py-2 px-5">
      <img className="h-[25px] w-[25px] rounded-full" src={imgURL} alt={imgALT} />
      <h1 className="font-bold">{Tittle}</h1>
    </div>
  )
}

export default LogoCards