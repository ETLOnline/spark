import React from 'react'
import { Card, CardContent } from '../ui/card'
import { LucideProps } from 'lucide-react'

interface StatCardProps {
	icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>
	value: string
	label: string
}


const StatCard = ({ icon, value, label }: StatCardProps) => {
	const Icon = icon
	return (
		<Card>
			<CardContent className="flex flex-col items-center justify-center p-6">
				<Icon className="h-8 w-8 mb-2 text-primary" />
				<p className="text-2xl font-bold">{value}</p>
				<p className="text-sm text-muted-foreground">{label}</p>
			</CardContent>
		</Card>
	)
}

export default StatCard