
import NotFound from "@/src/components/dashboard/NotFound/NotFound"
import ProfileActivities from "@/src/components/dashboard/profile/profile-activities"
import ProfileBio from "@/src/components/dashboard/profile/profile-bio"
import ProfileCalendar from "@/src/components/dashboard/profile/profile-calendar"
import ProfileRewards from "@/src/components/dashboard/profile/profile-rewards"
import ProfileFollowActions from "@/src/components/dashboard/profile/user/ProfileFollowActions"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs"
import { FindUserByUniqueId } from "@/src/server-actions/User/FindUserByUniqueId"
import { CalendarIcon, StarIcon, TrophyIcon, UserIcon } from "lucide-react"
import Link from "next/link"

const skillTags = ["React", "Next.js", "TypeScript", "UI/UX", "Node.js"]
const interests = ["Web Development", "AI", "Open Source", "Tech Writing"]
const recommendations = [
  {
    name: "Jane Doe",
    text: "An exceptional developer with a keen eye for detail.",
  },
  { name: "John Smith", text: "Always delivers high-quality work on time." },
]
const rewards = [
  {
    title: "Top Contributor",
    description: "Awarded for outstanding contributions to the team",
  },
  {
    title: "Innovation Champion",
    description: "Recognized for implementing creative solutions",
  },
]
const activities = [
  {
    date: "2023-04-01",
    description: "Completed the 'Advanced React Patterns' course",
  },
  {
    date: "2023-03-15",
    description: "Contributed to open-source project 'awesome-ui-components'",
  },
]

interface ProfileScreenProps {
  params:{
		id: string
	},
	searchParams: {
		tab?: string
	}
}

export default async function ProfileScreen({ params: { id }, searchParams:{tab} }: ProfileScreenProps) {

	const userRes = await FindUserByUniqueId(id)
	if(userRes.error || !userRes.data){
		return <NotFound />
	}

	const user = userRes.data

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
				<div className="flex flex items-center space-x-4">
					<Avatar className="h-20 w-20">
						<AvatarImage src={user?.profile_url || undefined} alt="Profile picture" />
						<AvatarFallback></AvatarFallback>
					</Avatar>
					<div>
						<h1 className="text-2xl font-bold">{user?.first_name} {user?.last_name}</h1>
						<p className="text-muted-foreground">{user?.email}</p>
					</div>
				</div>
				<ProfileFollowActions />
      </div>
      <Tabs defaultValue="basic" className="space-y-4" value={tab || 'basic'}>
        <TabsList>
					<Link href={`/profile/${id}/?tab=basic`}>
						<TabsTrigger value="basic">
							<UserIcon className="mr-2 h-4 w-4" />
							Bio/Basic
						</TabsTrigger>
					</Link>
					<Link href={`/profile/${id}/?tab=rewards`}>
						<TabsTrigger value="rewards" >
							<TrophyIcon className="mr-2 h-4 w-4" />
							Rewards
						</TabsTrigger>
					</Link>

					<Link href={`/profile/${id}/?tab=activity`}>
						<TabsTrigger
							value="activity"
						>
							<StarIcon className="mr-2 h-4 w-4" />
							Activity
						</TabsTrigger>
					</Link>

					<Link href={`/profile/${id}/?tab=calendar`}>
						<TabsTrigger
							value="calendar"
						>
							<CalendarIcon className="mr-2 h-4 w-4" />
							Calendar
						</TabsTrigger>
					</Link>
        </TabsList>
        <TabsContent value="basic">
          <ProfileBio
            skillTags={skillTags}
            interests={interests}
            recommendations={recommendations}
          />
        </TabsContent>
        <TabsContent value="rewards">
          <ProfileRewards rewards={rewards} />
        </TabsContent>
        <TabsContent value="activity">
          <ProfileActivities activities={activities} />
        </TabsContent>
        <TabsContent value="calendar">
          <ProfileCalendar />
        </TabsContent>
      </Tabs>
    </div>
  )
}
