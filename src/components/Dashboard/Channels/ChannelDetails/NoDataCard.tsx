import { Card, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Search } from 'lucide-react'
import React from 'react'

interface Props {
  title: string,
  description?: string
  icon?: React.ReactNode
}

function NoDataCard({ title, description, icon }: Props) {
  return (
    <div className="flex items-center justify-center w-full">
      <Card className="border-none">
        <CardHeader className="items-center">
          {
            icon ? icon : (
              <Search className="h-16 w-16 text-muted-foreground mb-4" />
            )
          }
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}

export default NoDataCard
