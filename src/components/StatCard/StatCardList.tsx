import React from 'react'
import { Globe2, Heart, Trophy, Users } from 'lucide-react'
import StatCard from './StatCard'

const stats = [
	{ icon: Users, label: "Active Mentors", value: "500+" },
	{ icon: Trophy, label: "Success Stories", value: "1,000+" },
	{ icon: Globe2, label: "Countries", value: "30+" },
	{ icon: Heart, label: "Satisfied Mentees", value: "10,000+" },
]


function StatCardList() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-4 gap-8 ">
			{
				stats.map(({ icon, value, label }, i) => {
					return (
						<StatCard key={i} icon={icon} value={value} label={label} />
					)
				}
				)
			}
		</div>
	)
}

export default StatCardList