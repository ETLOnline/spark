import React from 'react'
import ContactCard from './ContactCard'
import { Mail, MapPin, MessageSquare, Phone } from 'lucide-react'

const ContactCards = [
  {
    icon: Mail,
    title: "Email",
    description: "Drop us a line anytime.",
    value: "hello@mentorplatform.com",
  },
  {
    icon: Phone,
    title: "Phone",
    description: "Mon-Fri from 8am to 5pm.",
    value: "+1 (555) 000-0000",
  },
  {
    icon: MapPin,
    title: "Office",
    description: "Come say hello.",
    value: "123 Mentor Street, SF, CA 94103",
  },
  {
    icon: MessageSquare,
    title: "Live Chat",
    description: "Available 24/7.",
    value: "Start a conversation",
  },
]

function ContactCardList() {
  return (
    <div className="flex flex-wrap justify-between lg:gap-0 lg:col-start-1 col-span-4 space-y-4">
      {
        ContactCards.map(({ icon, title, description, value }, i) => {
          return (
            <ContactCard key={i} icon={icon} title={title} description={description} value={value} />
          )
        })
      }
    </div>
  )
}

export default ContactCardList