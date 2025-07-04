"use client"

import React, { useEffect, useRef, useState } from "react" // Added useRef and useState
import ProfileBio from "@/src/components/Dashboard/profile/profile-bio"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import {
  CalendarIcon,
  LinkIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  Plus,
  UserPlus,
  PencilIcon,
  GraduationCap
} from "lucide-react"
import { SelectTag, SelectUser } from "@/src/db/schema"
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
import { UpdateUserProfilePictureAction } from "@/src/server-actions/User/User"
import { useServerAction } from "@/src/hooks/useServerAction"
import Loader from "../../common/Loader/Loader"
import { LoaderSizes } from "../../common/types/loader-types"
import { useUser } from "@clerk/nextjs"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { auth } from "@clerk/nextjs/server"
import ProfileFollowActions from "./user/ProfileFollowActions"
import Image from "next/image"

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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, userData, error, updateUserProfile] = useServerAction(
    UpdateUserProfilePictureAction
  )
  const { user: clerkUser } = useUser()
  const [currentImageUrl, setCurrentImageUrl] = useState(user?.profile_url) // State to manage current profile image URL
  const [authUser, setAuthUser] = useState<SelectUser | null>(null)

  useEffect(() => {
    const GetAuthUser = async () => {
      const authUser = await AuthUserAction()
      if (authUser) {
        setAuthUser(authUser as SelectUser)
      }
    }
    GetAuthUser()
  }, [user])

  const handleCopyUrl = async () => {
    try {
      const url = generateUrl(`${getPagePath("profile")}/${user?.unique_id}`)
      await navigator.clipboard.writeText(url)
      toast({
        title: "URL copied!",
        description: "Profile URL copied to clipboard",
        duration: 3000
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy URL",
        duration: 3000
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = async () => {
      const base64 = reader.result as string
      setUploading(true)
      try {
        const res = await updateUserProfile(file.name, base64, file.type)
        if (res?.success && res.data) {
          setCurrentImageUrl(res.data.profile_picture_url)
          await clerkUser?.reload()
          toast({
            title: "Profile picture updated!",
            description: "Your profile picture has been successfully updated.",
            duration: 3000
          })
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: res?.error || "Failed to update profile picture",
            duration: 3000
          })
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Something went wrong",
          duration: 3000
        })
      } finally {
        setUploading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="container mx-auto md:p-6 p-2 relative">
      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
          <Loader size={LoaderSizes.xl} />
        </div>
      ) : null}

      {/* Banner with Avatar */}
      <div className="relative sm:h-44 h-36 shadow-sm shadow-secondary">
        <img
          src="/images/profile/background.svg"
          alt="Profile Banner"
          className=" w-full sm:h-48 h-36 rounded-lg shadow-sm shadow-secondary object-cover"
        />
        <div className="absolute bottom-0 left-16 transform -translate-x-1/2 translate-y-1/2">
          <div className="relative">
            {/* Added relative positioning for the button */}
            <Avatar className="h-28 w-28 border-4 bg-secondary border-secondary">
              <AvatarImage
                src={currentImageUrl || "/placeholder.png"} // Use currentImageUrl state
                alt="Profile"
                className="object-contain"
              />
              <AvatarFallback>IMG</AvatarFallback>
            </Avatar>
            {/* Edit Profile Picture Button */}
            {authUser?.unique_id === user?.unique_id ? (
              <>
                <button
                  className="absolute bottom-0 right-0 bg-background border rounded-full p-1 hover:bg-muted"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading || uploading} // Disable while loading or uploading
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </>
            ) : null}
          </div>
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
          {/* <p className="text-base text-muted-foreground">Postion</p>
          <p className="text-sm text-muted-foreground">Company Name</p> */}

          <div className="mt-2 flex flex-wrap sm:gap-6 gap-3 text-sm">
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

        {authUser?.unique_id === user?.unique_id ? null : (
          <ProfileFollowActions user={user} />
        )}
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio Section */}
          <div className="flex items-center justify-between ">
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              <span>Bio / Basic</span>
            </div>
            {authUser?.unique_id === user?.unique_id ? (
              <EditProfileModal />
            ) : null}
          </div>
          <ProfileBio
            userBio={user?.profile?.bio as string}
            recommendations={
              profileData?.recommendations as unknown as ExtendedRecommendations[]
            }
            tags={profileData?.tags as SelectTag[]}
          />
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
        {/* Right Column */}
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
                <GraduationCap className="h-6 w-6 text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="font-medium">{user.profile?.institute}</h4>
                  <p className="text-sm text-muted-foreground">
                    {user.profile?.degree}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {user.profile?.education_start_date} -{" "}
                      {user.profile?.education_end_date}
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
