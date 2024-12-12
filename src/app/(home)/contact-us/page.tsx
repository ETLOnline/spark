import React from 'react'
import './contact-us.css'
import ContactCardList from '@/src/components/ContactCard/ContactCardList'
import ContactCardForm from '@/src/components/ContactCard/ContactCardForm'


export default function ContactUsPage() {
  return (

    <div className="section">
      <h2 className='section-title text-center'>Getin Touch</h2>
      <p className="section-text text-center">Have questions? we're here to help and would love to hear from you</p>
      <div className="contact-section-content">
        <ContactCardList />
        <ContactCardForm />


      </div>
    </div>



  )
}