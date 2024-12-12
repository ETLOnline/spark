import React, { ReactNode } from 'react'
import { Card, CardContent } from '../ui/card'
import { LucideProps } from 'lucide-react'

interface ContactCardProps {
  icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>
  title: string
  description: ReactNode
  value: ReactNode
}

const ContactCard = ({ icon, title, description, value }: ContactCardProps) => {
  const Icon = icon
  return (
    <Card className='w-[100%] sm:w-[48%] md:w-[48%] mt-4 lg:mt-0 lg:w-full'>
      <CardContent className="flex flex-wrap  space-x-4 p-6">
        <Icon className="h-6 w-6 text-primary" />
        <div className='flex-wrap'>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground mb-1">{description}</p>
          <p className="text-sm font-medium">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default ContactCard