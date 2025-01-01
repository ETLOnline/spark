import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card'

function Contribute() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>How to Contribute</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Browse active projects</li>
          <li>Offer feedback and suggestions</li>
          <li>Join a project team</li>
          <li>Submit your own proposal</li>
        </ol>
      </CardContent>
    </Card>
  )
}

export default Contribute