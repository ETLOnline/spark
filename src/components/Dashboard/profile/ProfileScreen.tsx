"use client"

import React, { useEffect, useRef, useState } from "react" // Added useRef and useState
import ProfileBio from "@/src/components/Dashboard/profile/profile-bio"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import {
  CalendarIcon,
  LinkIcon,
  UserIcon,
  MailIcon,
  Plus,
  PencilIcon,
  GraduationCap,
  SquarePen,
  ListX,
  FlameKindling,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Globe,
  Trophy,
  Share2,
  CopyIcon
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
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from "@/src/components/ui/card"
import { generateUrl, getPagePath, getUserRole } from "@/src/utils/helpers"
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
import EditSocialLinksModal from "./user/SocialLinksModal"
import { SocialLinkItem } from "./user/SocialLinkItem"
import UserProfileCard from "./UserProfileCard"
import TrustEngineCard from "./trust-engine/TrustEngineCard"
import { getFeatureFlagAction } from "@/src/server-actions/FeatureFlag/FeatureFlag"
import { Input } from "../../ui/input"
import { Skeleton } from "../../ui/skeleton"
import { createAbsoluteUrl } from "@/src/utils/clientHelper"
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
  const [uploading, setUploading] = useState(false)
  const [loading, userData, error, updateUserProfile] = useServerAction(
    UpdateUserProfilePictureAction
  )
  const { user: clerkUser } = useUser()
  const [currentImageUrl, setCurrentImageUrl] = useState(user?.profile_url) // State to manage current profile image URL
  const [authUser, setAuthUser] = useState<SelectUser | null>(null)
  const [profile, setProfile] = useState(user.profile)
  const [certificates, setCertificates] = useState(user.certificates)
  const [isFeatureEnable, setIsFeatureEnable] = useState(false)
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
  const [referralLink, setReferralLink] = useState("")

  // Get the updated user from atom store to handle dynamic name updates
  const updatedUser = useAtomValue(userStore.AuthUser)

  // Use updated user data if this is the current user's profile, otherwise use prop
  const displayUser =
    authUser?.unique_id === user?.unique_id ? updatedUser || user : user

  const [recommendationLoading, , , GetRecommendations] = useServerAction(
    GetRecommendationAction
  )
  const [getFeatureFlagLoading, , , GetFeatureFlag] =
    useServerAction(getFeatureFlagAction)

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

  useEffect(() => {
    const fetchFeatureFlag = async () => {
      const res = await GetFeatureFlag(["Trust_Engine_Enabled"])
      if (res?.success && res?.data?.is_enabled) {
        setIsFeatureEnable(true)
      }
    }
    fetchFeatureFlag()
  }, [])

  const userInfo = {
    userFirstName: displayUser?.first_name || "",
    userLastName: displayUser?.last_name || "",
    userEmail: displayUser?.email || "",
    userProfileUrl: displayUser?.profile_url || null,
    userBio: displayUser?.profile?.bio || null,
    userRole: getUserRole(displayUser)
  }

  const CopyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink)
      toast({
        title: "Referral URL copied!",
        description: "Your referral link has been copied to clipboard.",
        duration: 3000
      })
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy referral link",
        duration: 3000
      })
    }
  }

  useEffect(() => {
    if (user?.unique_id === authUser?.unique_id) {
      const encodedId = btoa(user.unique_id)
      const ReferralURL = createAbsoluteUrl(`/?referral_id=${encodedId}`)
      setReferralLink(ReferralURL)
    }
  }, [user, authUser])

  return (
    <>
      <div className="container mx-auto md:p-6 p-2 relative">
        {loading || uploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
            <Loader size={LoaderSizes.xl} />
          </div>
        ) : null}
        {/* Banner */}
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
        </div>
        {/* Main Section */}
        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6 mx-16 -mt-16 md:-mt-16">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            <UserProfileCard
              userInfo={userInfo}
              currentImageUrl={currentImageUrl}
              handleCopyUrl={handleCopyUrl}
              onFileChange={handleFileChange}
            />
            {/* Trust Engine Section  */}

            {isFeatureEnable && <TrustEngineCard />}

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
                  <div>
                    <h1 className="text-gray-400">Email</h1>
                    <span className="truncate ">{user?.email}</span>
                  </div>
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

            {/* Referral Link */}
            {authUser?.unique_id === user?.unique_id && (
              <Card>
                <CardHeader>
                  <CardTitle>Referral Link</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Share2 className="h-5 w-5 text-gray-500" />
                      <h1 className="text-gray-400">Link</h1>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm text-muted-foreground">
                      {referralLink ? (
                        <Input
                          type="text w-auto"
                          value={referralLink}
                          readOnly
                        />
                      ) : (
                        <Skeleton className="h-8 w-32" />
                      )}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={CopyReferralLink}
                      disabled={!referralLink}
                    >
                      <CopyIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
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
                  <GraduationCap className="h-6 w-6 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0 ">
                    <h4 className="font-medium truncate">
                      {profile?.institute}
                    </h4>
                    <p className="text-sm text-muted-foreground truncate">
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
            {/* Socail Links */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Social Links
                  {authUser?.unique_id === user?.unique_id && (
                    <EditSocialLinksModal
                      user={user}
                      profile={profile as SelectProfile}
                      setprofile={setProfile}
                    />
                  )}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-3">
                {!profile?.github_url &&
                  !profile?.linkedin_url &&
                  !profile?.instagram_url &&
                  !profile?.twitter_url &&
                  !profile?.personal_website_url && (
                    <p className="text-muted-foreground text-center">
                      No social links added
                    </p>
                  )}

                {profile?.personal_website_url && (
                  <SocialLinkItem
                    icon={<Globe className="h-4 w-4" />}
                    label="Website"
                    url={profile.personal_website_url}
                  />
                )}

                {profile?.github_url && (
                  <SocialLinkItem
                    icon={<Github className="h-4 w-4" />}
                    label="GitHub"
                    url={profile.github_url}
                  />
                )}

                {profile?.linkedin_url && (
                  <SocialLinkItem
                    icon={<Linkedin className="h-4 w-4" />}
                    label="LinkedIn"
                    url={profile.linkedin_url}
                  />
                )}

                {profile?.twitter_url && (
                  <SocialLinkItem
                    icon={<Twitter className="h-4 w-4" />}
                    label="Twitter"
                    url={profile.twitter_url}
                  />
                )}

                {profile?.instagram_url && (
                  <SocialLinkItem
                    icon={<Instagram className="h-4 w-4" />}
                    label="Instagram"
                    url={profile.instagram_url}
                  />
                )}
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

            {/* Your Standing Card */}
            {isFeatureEnable && (
              <Card className="p-6">
                <CardTitle className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  {authUser?.unique_id === user?.unique_id
                    ? "Your Standing"
                    : "Standing"}
                </CardTitle>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Community Members
                    </div>
                    <div className="text-lg font-bold text-primary">348</div>
                  </div>
                  <div className="border-t ">
                    <div className="text-sm text-muted-foreground  pt-3">
                      Your Percentile Rank
                    </div>
                    <div className="text-lg font-bold text-primary">96%</div>
                  </div>
                </div>
              </Card>
            )}
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
