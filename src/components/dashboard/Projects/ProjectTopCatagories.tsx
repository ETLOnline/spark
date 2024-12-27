import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'
import { Badge } from '../../ui/badge'

interface Props {
  categories: string[]
}

function ProjectTopCatagories({ categories }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {categories.slice(0, 5).map((category, index) => (
            <li key={index} className="flex justify-between items-center">
              <span>{category}</span>
              <Badge variant="secondary">
                {Math.floor(Math.random() * 20) + 1}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export default ProjectTopCatagories