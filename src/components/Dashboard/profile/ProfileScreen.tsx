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
  GraduationCap,
  SquarePen,
  ListX,
  FlameKindling
} from "lucide-react"
import {
  SelectCertificate,
  SelectProfile,
  SelectRecommendation,
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
import { generateUrl, getPagePath, getUserRole } from "@/src/utils/helpers"
import EditProfileModal from "./edit-profile-modal"
import { UpdateUserProfilePictureAction } from "@/src/server-actions/User/User"
import { useServerAction } from "@/src/hooks/useServerAction"
import Loader from "../../common/Loader/Loader"
import { LoaderSizes } from "../../common/types/loader-types"
import { useUser } from "@clerk/nextjs"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import ProfileFollowActions from "./user/ProfileFollowActions"
import EditEducationModal from "./EditEducationModal"
import CertificateModal from "./CertificateModal"
import RecommendationsModal from "./RecommendationsModal"
import { GetRecommendationAction } from "@/src/server-actions/Recommendation/recommendation"
import moment from "moment"
import ChangeCoverImageDialog from "./changeCoverImageDialog"
import Image from "next/image"
import { useAtomValue } from "jotai"
import { userStore } from "@/src/store/user/userStore"

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
  const [profile, setProfile] = useState(user.profile)
  const [certificates, setCertificates] = useState(user.certificates)
  const [isQualificationModalOpen, setIsQualificationModalOpen] =
    useState(false)
  const [selectedCertificate, setSelectedCertificate] =
    useState<SelectCertificate | null>(null)
  const [isChangeCoverImageOpen, setIsChangeCoverImageOpen] = useState(false)

  const [recommendations, setRecommendations] = useState<
    SelectRecommendation[]
  >([])
  const [averageRating, setAverageRating] = useState(
    user.profile?.total_average_rating
  )
  const [coverImage, setCoverImage] = useState(user.cover_image)

  // Get the updated user from atom store to handle dynamic name updates
  const updatedUser = useAtomValue(userStore.AuthUser)

  // Use updated user data if this is the current user's profile, otherwise use prop
  const displayUser =
    authUser?.unique_id === user?.unique_id ? updatedUser || user : user

  const [recommendationLoading, , , GetRecommendations] = useServerAction(
    GetRecommendationAction
  )

  useEffect(() => {
    const GetAuthUser = async () => {
      const authUser = await AuthUserAction()
      if (authUser) {
        setAuthUser(authUser as SelectUser)
      }
    }
    GetAuthUser()
  }, [user])

  useEffect(() => {
    const GetUserRecommendations = async () => {
      const res = await GetRecommendations(user.unique_id)

      if (res?.success && res?.data) {
        setRecommendations(res.data.recommendations as SelectRecommendation[])
      }
    }

    GetUserRecommendations()
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

  function handleEditCertificate(Certificate: SelectCertificate) {
    setSelectedCertificate(Certificate)
    setIsQualificationModalOpen(true)
  }

  return (
    <>
      <div className="container mx-auto md:p-6 p-2 relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
            <Loader size={LoaderSizes.xl} />
          </div>
        ) : null}
        {/* Banner with Avatar */}
        <div className="relative sm:h-44 h-36 shadow-sm  rounded-lg">
          {coverImage ? (
            <Image
              src={coverImage}
              alt="Cover Image"
              width={1000}
              height={1000}
              objectFit="cover"
              className="w-full h-36 sm:h-44 rounded-lg"
            />
          ) : (
            <div className=" w-full sm:h-44 h-36 rounded-lg shadow-sm shadow-secondary object-cover cover-pattern" />
          )}

          {/* Change Cover Image Button */}
          {authUser?.unique_id === user?.unique_id && (
            <Button
              variant={"outline"}
              className="absolute top-2 right-2 bg-background"
              onClick={() => setIsChangeCoverImageOpen(true)}
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
          )}

          <div className="absolute bottom-0 left-16 transform -translate-x-1/2 translate-y-1/2">
            <div className="relative">
              {/* Added relative positioning for the button */}
              <Avatar className="h-28 w-28 border-4 bg-secondary border-black">
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
              <div className="flex flex-col items-center gap-1 ">
                <h2 className="text-xl sm:text-2xl font-bold inline-flex items-center">
                  {displayUser.first_name} {displayUser.last_name}
                </h2>
                <p className="w-full text-sm text-muted-foreground">
                  {getUserRole(displayUser)}
                </p>
              </div>
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

            {/* for future use */}
            {/* <div className="mt-2 flex flex-wrap sm:gap-6 gap-3 text-sm">
            <div className="flex items-center gap-1">
              <UserIcon className="h-4 w-4" />
              <span className="font-medium">{user.contacts?.filter(c=> c.is_accepted === 1).length}</span>
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
          </div> */}
          </div>

          {authUser === null ? null : authUser?.unique_id ===
            user?.unique_id ? null : (
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
              tags={profileData?.tags as SelectTag[]}
            />
            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    Recommendations
                    <p className="flex items-center gap-1 text-muted-foreground">
                      {user?.profile?.number_of_ratings &&
                      user?.profile?.number_of_ratings > 0 ? (
                        <>
                          {averageRating
                            ? parseFloat(averageRating).toFixed(1)
                            : ""}
                          <FlameKindling className="h-6 w-6 text-[#92400e] fill-[#fde68a]" />
                        </>
                      ) : null}
                    </p>
                  </div>
                  {authUser?.unique_id !== user?.unique_id && (
                    <RecommendationsModal
                      userId={user?.unique_id}
                      authUserId={authUser?.unique_id}
                      recommendations={recommendations}
                      setRecommendations={setRecommendations}
                      setAverageRating={setAverageRating}
                    />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {recommendations.length > 0 ? (
                    recommendations?.map((recommendation) => (
                      <div
                        className="flex items-start gap-3"
                        key={recommendation.id}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={recommendation?.recommender?.profile_url || ""}
                          />
                          <AvatarFallback>
                            {recommendation?.recommender?.first_name || ""}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">
                              {recommendation?.recommender?.first_name}{" "}
                              {recommendation?.recommender?.last_name}
                            </h4>
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              {recommendation.rating}
                              <FlameKindling className="h-4 w-4 text-[#92400e] fill-[#fde68a]" />
                            </span>
                            <span className="text-sm text-muted-foreground">
                              •
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {moment(recommendation.created_at).format(
                                "DD MMMM YYYY"
                              )}
                            </span>
                          </div>
                          <p className="mt-2 text-sm">
                            {recommendation.content}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center">
                      <p className="text-muted-foreground">
                        No Recommendations
                      </p>
                    </div>
                  )}
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
                  <span className="truncate ">{user?.email}</span>
                </div>
                {/* for future use */}
                {/* <div className="flex items-center space-x-2">
                <PhoneIcon className="h-5 w-5 text-gray-500" />
                <span>+923001234567</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPinIcon className="h-5 w-5 text-gray-500" />
                <span>City, Country</span>
              </div> */}
              </CardContent>
            </Card>
            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Education
                  {authUser?.unique_id === user?.unique_id && (
                    <EditEducationModal
                      user={user}
                      profile={profile as SelectProfile}
                      setprofile={setProfile}
                    />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <GraduationCap className="h-6 w-6 text-muted-foreground mt-0.5" />
                  <div>
                    <h4 className="font-medium">{profile?.institute}</h4>
                    <p className="text-sm text-muted-foreground">
                      {profile?.degree}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {profile?.education_start_date} -{" "}
                        {profile?.education_end_date}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Qualifications & Certifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Qualifications & Certifications
                  {authUser?.unique_id === user?.unique_id && (
                    <Button
                      size={"sm"}
                      variant={"outline"}
                      onClick={() => setIsQualificationModalOpen(true)}
                    >
                      <Plus className=" h-4 w-4" />
                    </Button>
                  )}
                  <CertificateModal
                    UserId={user.unique_id}
                    certificates={certificates}
                    setCertificates={setCertificates}
                    isDialogOpen={isQualificationModalOpen}
                    setIsDialogOpen={setIsQualificationModalOpen}
                    selectedCertificate={selectedCertificate}
                    setSelectedCertificate={setSelectedCertificate}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {certificates?.length && certificates?.length > 0 ? (
                  certificates
                    ?.filter(
                      (certificate) => certificate.user_id === user?.unique_id
                    )
                    .map((certificate) => (
                      <div className="space-y-1" key={certificate.id}>
                        <h4 className="font-medium text-sm flex items-center justify-between">
                          {certificate.title}
                          {authUser?.unique_id === user?.unique_id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCertificate(certificate)}
                            >
                              <SquarePen className="h-2 w-2" />
                            </Button>
                          )}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {certificate.institute}
                        </p>
                        <div className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {certificate.year}
                          </span>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="w-full">
                    <h4 className="font-medium text-sm flex flex-col items-center justify-center text-muted-foreground text-center">
                      <ListX className="h-10 w-10 " />
                      No Qualifications & Certifications
                    </h4>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ChangeCoverImageDialog
        user={user}
        isChangeCoverImageOpen={isChangeCoverImageOpen}
        setIsChangeCoverImageOpen={setIsChangeCoverImageOpen}
        setUserCoverImage={setCoverImage}
      />
    </>
  )
}
