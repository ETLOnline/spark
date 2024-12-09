import React from 'react'
import MissionCard from './MissionCard'

const MissionCards = [
	{
		title: "Connect",
		description: "Bringing together mentors and mentees from around the globe.",
	},
	{
		title: "Empower",
		description: "Providing the tools and knowledge needed to succeed.",
	},
	{
		title: "Grow",
		description: "Fostering continuous learning and professional development.",
	},
]

function MissionCardList() {
	return (

		<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
			{
				MissionCards.map(({ title, description }, i) => {
					return (
						<MissionCard key={i} title={title} description={description} />
					)
				}
				)
			}
		</div>

	)
}

export default MissionCardList