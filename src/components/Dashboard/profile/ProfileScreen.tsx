"use client"

import ProfileActivities from "@/src/components/Dashboard/profile/profile-activities"
import ProfileBio from "@/src/components/Dashboard/profile/profile-bio"
// import ProfileCalendar from "@/src/components/Dashboard/profile/profile-calendar"
import ProfileRewards from "@/src/components/Dashboard/profile/profile-rewards"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/src/components/ui/tabs"
import {
  CalendarIcon,
  LinkIcon,
  UserIcon,
  UsersIcon,
  UserPlusIcon,
  TrophyIcon,
  StarIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  Plus,
  UserPlus,
  GraduationCap,
  Locate,
  User
} from "lucide-react"
import Link from "next/link"
import {
  SelectActivity,
  SelectReward,
  SelectTag,
  SelectUser
} from "@/src/db/schema"
import { ExtendedRecommendations, Profile } from "./types/profile-types"
import { Button } from "@/src/components/ui/button"
import { useToast } from "@/src/hooks/use-toast"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/src/components/ui/tooltip"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from "@/src/components/ui/card"
import { generateUrl, getPagePath } from "@/src/utils/helpers"
import EditProfileModal from "./edit-profile-modal"

type ProfileScreenProps = {
  tab?: string
  user: SelectUser
  profileData: Profile
}

export default function ProfileScreen({
  tab,
  user,
  profileData
}: ProfileScreenProps) {
  const { toast } = useToast()

  const handleCopyUrl = async () => {
    try {
      const url = generateUrl(`${getPagePath("profile")}/${user?.unique_id}`)
      await navigator.clipboard.writeText(url)
      toast({
        title: "URL copied!",
        description: "Profile URL copied to clipboard",
        duration: 3000
      })
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy URL",
        duration: 3000
      })
    }
  }

  return (
    <div className="container mx-auto md:p-6 p-2">
      {/* Banner with Avatar */}
      <div
        className="relative sm:h-44 h-36 rounded-lg bg-cover bg-center shadow-sm shadow-secondary"
        style={{
          backgroundImage: `url("https://placehold.co/400")`
        }}
      >
        <div className="absolute bottom-0 left-16 transform -translate-x-1/2 translate-y-1/2">
          <Avatar className="h-24 w-24 border-4 border-white">
            <AvatarImage
              src={user.profile_url || "/placeholder.png"}
              alt="Profile"
            />
            <AvatarFallback>IMG</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Profile */}
      <div className="mt-16 flex flex-wrap justify-between items-center">
        <div className="flex flex-col items-start">
          <div className="flex items-center">
            <h2 className="text-xl sm:text-2xl font-bold inline-flex items-center">
              {user.first_name} {user.last_name}
            </h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="ml-2"
                    onClick={handleCopyUrl}
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy profile URL</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-base text-muted-foreground">Postion</p>
          <p className="text-sm text-muted-foreground">Company Name</p>

          <div className="mt-2 flex gap-6 text-sm">
            <div className="flex items-center gap-1">
              <UserIcon className="h-4 w-4" />
              <span className="font-medium">000</span>
              <span className="text-muted-foreground">connections</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">000</span>
              <span className="text-muted-foreground">followers</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium">000</span>
              <span className="text-muted-foreground">following</span>
            </div>
          </div>
        </div>

        <div className="mt-4 lg:mt-0 flex space-x-2">
          <Button>
            {" "}
            <UserPlus className="h-4 w-4" /> Connect
          </Button>
          <Button disabled variant="outline">
            {" "}
            <Plus className="h-4 w-4" /> Follow
          </Button>
        </div>
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <UserIcon className="h-4 w-4" />
                <span>Bio / Basic</span>
              </CardTitle>
              <EditProfileModal />
            </CardHeader>
            <CardContent>
              <ProfileBio
                userBio={user?.bio as string}
                recommendations={
                  profileData?.recommendations as unknown as ExtendedRecommendations[]
                }
                tags={profileData?.tags as SelectTag[]}
              />
            </CardContent>
          </Card>
          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder.svg" alt="Jane Smith" />
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">Junaid Sami</h4>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">
                        10/06/2025
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Software Developer at ETL Online
                    </p>
                    <p className="mt-2 text-sm">
                      Abdul is a dedicated developer with great problem-solving
                      skills. His attention to detail and willingness to help
                      others makes him a great team player.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Right */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center space-x-2">
                <MailIcon className="h-5 w-5 text-gray-500" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <PhoneIcon className="h-5 w-5 text-gray-500" />
                <span>+923001234567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPinIcon className="h-5 w-5 text-gray-500" />
                <span>City, Country</span>
              </div>
            </CardContent>
          </Card>
          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <CalendarIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="font-medium">PUCIT</h4>
                  <p className="text-sm text-muted-foreground">
                    Bachelor of Science in Computer Science
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Graduated 2025
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Qualifications & Certifications */}
          <Card>
            <CardHeader>
              <CardTitle>Qualifications & Certifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <h4 className="font-medium text-sm">
                  Meta Full Stack Developer Certificate
                </h4>
                <p className="text-sm text-muted-foreground">Meta</p>
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">2024</span>
                </div>
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-sm">
                  MongoDB Developer Certification
                </h4>
                <p className="text-sm text-muted-foreground">
                  MongoDB University
                </p>
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">2025</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
