import React, { ReactNode } from 'react'
import './Container.css'

const Container = ({children}:{children:ReactNode}) => {
  return (
    <div className='body-container'>
        <div className='container-item'>
            {children}
        </div>
    </div>
  )
}

export default Container