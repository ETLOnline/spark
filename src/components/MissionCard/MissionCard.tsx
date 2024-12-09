import React, { ReactNode } from 'react'
import { Card, CardContent } from '../ui/card'

interface MissionCardProps {
	title: ReactNode
	description: ReactNode
}

const MissionCard = ({ title, description }: MissionCardProps) => {
	return (
		<Card>
			<CardContent className="p-6">
				<h3 className="text-xl font-semibold mb-2">{title}</h3>
				<p className="text-muted-foreground">{description}</p>
			</CardContent>
		</Card>
	)
}

export default MissionCard