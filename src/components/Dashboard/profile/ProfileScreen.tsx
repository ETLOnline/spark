"use client"

import React, { useEffect, useState } from "react"
import ProfileBio from "@/src/components/Dashboard/profile/profile-bio"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import {
  CalendarIcon,
  CalendarDays,
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
  Share2,
  CopyIcon,
  Target,
  Briefcase,
  Building2,
  Video,
  CheckCircle2,
  Inbox,
  LayoutGrid,
  ArrowRight
} from "lucide-react"
import {
  SelectCertificate,
  SelectProfile,
  SelectRecommendation,
  SelectSessionRequest,
  SelectSpace,
  SelectTag,
  SelectUser
} from "@/src/db/schema"
import { GetSpacesByCreatorAction } from "@/src/server-actions/Space/Space"
import { ExtendedRecommendations, Profile } from "./types/profile-types"
import { Button } from "@/src/components/ui/button"
import { useToast } from "@/src/hooks/use-toast"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/src/components/ui/card"
import { generateUrl, getPagePath, getUserRole } from "@/src/utils/helpers"
import { REPUTATION_POINTS_REWARD_ID } from "@/src/utils/constants"
import { UpdateUserProfilePictureAction } from "@/src/server-actions/User/User"
import { useServerAction } from "@/src/hooks/useServerAction"
import Loader from "../../common/Loader/Loader"
import { LoaderSizes } from "../../common/types/loader-types"
import { useUser } from "@clerk/nextjs"
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
import EditMentorModal from "./EditMentorModal"
import {
  GetAcceptedSessionRequestsForMentorAction,
  GetMentorAvailabilityAction
} from "@/src/server-actions/Mentor/MentorActions"
import { toLocalDateStr } from "@/src/lib/utils"
import Link from "next/link"
import { SocialLinkItem } from "./user/SocialLinkItem"
import UserProfileCard from "./UserProfileCard"
import ProfileCompletionCard from "./ProfileCompletionCard"
import useUserProfile from "./hooks/useUserProfile"
import TrustEngineCard from "./trust-engine/TrustEngineCard"
import { getFeatureFlagAction } from "@/src/server-actions/FeatureFlag/FeatureFlag"
import {
  GetUserApprovedVerificationCountAction,
  GetUserReviewedVerificationCountAction,
  GetUserRewardBalanceAction
} from "@/src/server-actions/Reward/Reward"
import { Input } from "../../ui/input"
import { Skeleton } from "../../ui/skeleton"
import { createAbsoluteUrl } from "@/src/utils/clientHelper"
import ViewAvailabilityButton from "./ViewAvailabilityButton"
import EditFypInfoModal from "./EditFypInfoModal"
import MentorSessionsCard from "./MentorSessionsCard"

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
  const [currentImageUrl, setCurrentImageUrl] = useState(user?.profile_url)
  const [profile, setProfile] = useState(user.profile)
  const [certificates, setCertificates] = useState(user.certificates)
  const [isFeatureEnable, setIsFeatureEnable] = useState(false)
  const [isQualificationModalOpen, setIsQualificationModalOpen] =
    useState(false)
  const [selectedCertificate, setSelectedCertificate] =
    useState<SelectCertificate | null>(null)
  const [isChangeCoverImageOpen, setIsChangeCoverImageOpen] = useState(false)
  const [isMyProfile, setIsMyProfile] = useState<boolean | undefined>(undefined)

  const [recommendations, setRecommendations] = useState<
    SelectRecommendation[]
  >([])
  const [averageRating, setAverageRating] = useState(
    user.profile?.total_average_rating
  )
  const [coverImage, setCoverImage] = useState(user.cover_image)
  const [referralLink, setReferralLink] = useState("")
  const [mentorSlots, setMentorSlots] = useState<
    {
      id: number
      date: string
      repeat_type: string
      repeat_end_date: string | null
    }[]
  >([])
  const [, , , getMentorAvailability] = useServerAction(
    GetMentorAvailabilityAction
  )
  const [mentorSpaces, setMentorSpaces] = useState<SelectSpace[]>([])
  const [, , , getSpacesByCreator] = useServerAction(GetSpacesByCreatorAction)
  const [acceptedMentorSessions, setAcceptedMentorSessions] = useState<
    SelectSessionRequest[]
  >([])
  const [, , , getAcceptedMentorSessions] = useServerAction(
    GetAcceptedSessionRequestsForMentorAction
  )
  const authUser = useAtomValue(userStore.AuthUser)

  const displayUser = isMyProfile && authUser ? authUser : user
  const isStudent = !!getUserRole(user)?.includes("Student")

  const isMentor = !!getUserRole(user)?.includes("Mentor")

  const [, , , profileSkills, profileInterests] = useUserProfile()

  const [recommendationLoading, , , GetRecommendations] = useServerAction(
    GetRecommendationAction
  )
  const [getFeatureFlagLoading, , , GetFeatureFlag] =
    useServerAction(getFeatureFlagAction)

  const [verifiedTaskCount, setVerifiedTaskCount] = useState<number>(0)
  const [reviewedTaskCount, setReviewedTaskCount] = useState<number>(0)

  const [, , , GetReviewedTaskCount] = useServerAction(
    GetUserReviewedVerificationCountAction
  )
  const [, , , GetVerifiedTaskCount] = useServerAction(
    GetUserApprovedVerificationCountAction
  )

  const [viewerRp, setViewerRp] = useState<number>(0)
  const [, , , GetViewerRpBalance] = useServerAction(GetUserRewardBalanceAction)

  useEffect(() => {
    if (authUser && user) {
      setIsMyProfile(authUser.unique_id === user.unique_id)
    }
  }, [authUser, user])

  useEffect(() => {
    if (!authUser || isMyProfile) return
    const fetchViewerRp = async () => {
      const res = await GetViewerRpBalance(
        authUser.unique_id,
        REPUTATION_POINTS_REWARD_ID
      )
      if (res?.success && res.data) {
        setViewerRp(res.data.current_balance ?? 0)
      }
    }
    fetchViewerRp()
  }, [authUser, isMyProfile])

  // Fetch mentor slots for both owner and viewer — used to derive availability status
  useEffect(() => {
    if (!isMentor) return
    const fetchSlots = async () => {
      const res = await getMentorAvailability(user.unique_id)
      if (res?.success && res.data) {
        setMentorSlots(res.data.filter((s) => s.is_active))
      }
    }
    fetchSlots()
  }, [isMentor, user.unique_id])

  // Independent spaces the mentor created — only relevant on their own profile
  useEffect(() => {
    if (!isMentor || !isMyProfile) return
    const fetchMentorSpaces = async () => {
      const res = await getSpacesByCreator(user.unique_id)
      if (res?.success && res.data) {
        setMentorSpaces(res.data.spaces)
      }
    }
    fetchMentorSpaces()
  }, [isMentor, isMyProfile, user.unique_id])

  // Accepted bookings — shown publicly on the mentor's profile
  useEffect(() => {
    if (!isMentor) return
    const fetchAcceptedMentorSessions = async () => {
      const res = await getAcceptedMentorSessions(user.unique_id)
      if (res?.success && res.data) {
        setAcceptedMentorSessions(res.data as SelectSessionRequest[])
      }
    }
    fetchAcceptedMentorSessions()
  }, [isMentor, user.unique_id])

  // A mentor is "available" if they have at least one slot that hasn't expired
  const todayStr = toLocalDateStr(new Date())
  const isAvailable = mentorSlots.some((s) => {
    if (s.repeat_type === "none") return s.date >= todayStr
    // daily / weekly: available unless repeat_end_date is in the past
    return !s.repeat_end_date || s.repeat_end_date >= todayStr
  })

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

  useEffect(() => {
    const fetchVerifiedCount = async () => {
      const res = await GetVerifiedTaskCount(user.unique_id)
      if (res?.success && res.data !== undefined) {
        setVerifiedTaskCount(res.data)
      }

      const reviewRes = await GetReviewedTaskCount(user.unique_id)
      if (reviewRes?.success && reviewRes.data !== undefined) {
        setReviewedTaskCount(reviewRes.data)
      }
    }
    fetchVerifiedCount()
  }, [user.unique_id])

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
    if (isMyProfile) {
      const encodedId = btoa(user.unique_id)
      const ReferralURL = createAbsoluteUrl(`/?referral_id=${encodedId}`)
      setReferralLink(ReferralURL)
    }
  }, [isMyProfile])

  return (
    <>
      <div className="container mx-auto p-3 sm:p-6 relative">
        {loading || uploading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
            <Loader size={LoaderSizes.xl} />
          </div>
        ) : null}
        {/* Banner */}
        <div className="relative h-32 sm:h-44 shadow-sm rounded-lg">
          {coverImage ? (
            <Image
              src={coverImage}
              alt="Cover Image"
              width={1000}
              height={1000}
              objectFit="cover"
              className="w-full h-32 sm:h-44 rounded-lg"
            />
          ) : (
            <div className="w-full h-32 sm:h-44 rounded-lg shadow-sm shadow-secondary object-cover cover-pattern" />
          )}

          {/* Change Cover Image Button */}
          {isMyProfile && (
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
        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mx-2 sm:mx-8 lg:mx-16 -mt-12 sm:-mt-16">
          {/* Left */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <UserProfileCard
              userInfo={displayUser}
              currentImageUrl={currentImageUrl}
              handleCopyUrl={handleCopyUrl}
              onFileChange={handleFileChange}
              isMyProfile={isMyProfile}
            />

            {/* Trust Engine Section  */}
            {isFeatureEnable && (
              <TrustEngineCard user={user} isMyProfile={isMyProfile} />
            )}

            <ProfileBio
              userBio={user?.profile?.bio as string}
              tags={profileData?.tags as SelectTag[]}
              isMyProfile={isMyProfile}
            />
            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0">
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
                  {!isMyProfile && (
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
                        className="flex flex-col sm:flex-row items-start gap-3"
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
                        <div className="flex-1 w-full">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-medium">
                              {recommendation?.recommender?.first_name}{" "}
                              {recommendation?.recommender?.last_name}
                            </h4>
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              {recommendation.rating}
                              <FlameKindling className="h-4 w-4 text-[#92400e] fill-[#fde68a]" />
                            </span>
                            <span className="hidden sm:inline text-sm text-muted-foreground">
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

            {isMentor && (
              <MentorSessionsCard acceptedRequests={acceptedMentorSessions} />
            )}
          </div>
          {/* Right Column */}
          <div className="space-y-4 sm:space-y-6">
            {/* Your Standing Card */}
            {isFeatureEnable && (
              <Card className="p-4 sm:p-6 spark-gradient-panel-bg">
                <CardTitle className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  {isMyProfile ? "Your Standing" : "Standing"}
                </CardTitle>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Verified Task Completions
                    </div>
                    <div className="text-lg font-bold text-primary">
                      {verifiedTaskCount}
                    </div>
                  </div>
                  <div className="border-t">
                    <div className="text-sm text-muted-foreground pt-3">
                      Task review verification
                    </div>
                    <div className="text-lg font-bold text-primary">
                      {reviewedTaskCount}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Profile Completion Card */}

            {isMyProfile && (
              <ProfileCompletionCard
                user={displayUser}
                profile={displayUser?.profile as SelectProfile}
                skills={profileSkills}
                interests={profileInterests}
                isMentor={isMentor}
                hasAvailability={isAvailable}
                onProfileUpdated={(payload) => {
                  if (payload.profile) {
                    setProfile(
                      (prev) =>
                        ({ ...prev, ...payload.profile }) as SelectProfile
                    )
                  }
                }}
              />
            )}
            {isStudent && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    FYP & Learning Goals
                    {isMyProfile && (
                      <EditFypInfoModal
                        user={user}
                        profile={profile as SelectProfile}
                        setProfile={setProfile}
                      />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <FlameKindling className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        FYP Status
                      </p>
                      <p className="text-sm font-medium break-words">
                        {profile?.fyp_status || "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Target className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">
                        Learning Goals
                      </p>
                      <p className="text-sm font-medium break-words whitespace-pre-wrap">
                        {profile?.learning_goals || "—"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Mentor Info — shown to owner always; to others only when both fields are filled */}
            {isMentor &&
              (isMyProfile ||
                (!!profile?.professional_title?.trim() &&
                  !!profile?.company?.trim())) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        Mentorship
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            isAvailable
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {isAvailable ? "Available" : "No Availability Set"}
                        </span>
                        {isMyProfile && (
                          <EditMentorModal
                            user={user}
                            profile={profile as SelectProfile}
                            setProfile={setProfile}
                          />
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Professional Title — always shown */}
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          Professional Title
                        </p>
                        <p className="text-sm font-medium break-words">
                          {profile?.professional_title || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Company — always shown */}
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          Company / Organisation
                        </p>
                        <p className="text-sm font-medium break-words">
                          {profile?.company || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Engagement Type */}
                    <div className="flex items-center gap-3">
                      <Video className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          Engagement Type
                        </p>
                        <p className="text-sm font-medium break-words capitalize">
                          {profile?.engagement_type || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Completed Sessions */}
                    {(profile?.total_completed_sessions ?? 0) > 0 && (
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Completed Sessions
                          </p>
                          <p className="text-sm font-medium">
                            {profile?.total_completed_sessions}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Mentor: manage their own availability */}
                    {isMyProfile && (
                      <Link href="/profile/availability" className="w-full">
                        <Button
                          variant="outline"
                          className="w-full mt-2"
                          size="sm"
                        >
                          <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                          Manage Availability
                        </Button>
                      </Link>
                    )}

                    {/* Mentor: review incoming session requests */}
                    {isMyProfile && (
                      <Link href="/profile/session-requests" className="w-full">
                        <Button
                          variant="outline"
                          className="w-full mt-2"
                          size="sm"
                        >
                          <Inbox className="h-4 w-4 mr-2 text-muted-foreground" />
                          Session Requests
                        </Button>
                      </Link>
                    )}

                    {/* Viewer: see mentor's availability + jump straight to requesting a session */}
                    {!isMyProfile && mentorSlots.length > 0 && (
                      <ViewAvailabilityButton
                        mentorId={user.unique_id}
                        viewerRp={viewerRp}
                      />
                    )}
                  </CardContent>
                </Card>
              )}

            {/* Mentor: active independent spaces */}
            {isMyProfile && mentorSpaces.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4" />
                    Active Spaces
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {mentorSpaces.slice(0, 3).map((space) => (
                    <Link
                      key={space.id}
                      href={`/mentorship/${user.unique_id}/spaces/${encodeURIComponent(space.space_slug)}`}
                      className="flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent transition-colors"
                    >
                      <span className="truncate">{space.space_name}</span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                    </Link>
                  ))}

                  <Link
                    href={`/mentorship/${user.unique_id}/spaces`}
                    className="w-full"
                  >
                    <Button variant="outline" className="w-full mt-2" size="sm">
                      Show All Spaces
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Education
                  {isMyProfile && (
                    <EditEducationModal
                      user={user}
                      profile={profile as SelectProfile}
                      setprofile={setProfile}
                      hasData={!!(profile?.institute || profile?.degree)}
                    />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <GraduationCap className="h-6 w-6 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <h4 className="font-medium break-words">
                      {profile?.institute}
                    </h4>
                    <p className="text-sm text-muted-foreground break-words">
                      {profile?.degree}
                    </p>
                    <div className="flex flex-wrap items-center gap-1 mt-1">
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
            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Social Links
                  {isMyProfile && (
                    <EditSocialLinksModal
                      user={user}
                      profile={profile as SelectProfile}
                      setprofile={setProfile}
                      hasData={
                        !!(
                          profile?.github_url ||
                          profile?.linkedin_url ||
                          profile?.instagram_url ||
                          profile?.twitter_url ||
                          profile?.personal_website_url
                        )
                      }
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
                <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
                  <span className="truncate">
                    Qualifications & Certifications
                  </span>
                  <div className="flex items-center gap-2">
                    {isMyProfile && (
                      <Button
                        size={"sm"}
                        variant={"outline"}
                        onClick={() => setIsQualificationModalOpen(true)}
                      >
                        <Plus className="h-4 w-4" />
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
                  </div>
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
                        <h4 className="font-medium text-sm flex items-start sm:items-center justify-between gap-2">
                          <span className="break-words flex-1">
                            {certificate.title}
                          </span>
                          {isMyProfile && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-shrink-0"
                              onClick={() => handleEditCertificate(certificate)}
                            >
                              <SquarePen className="h-4 w-4 sm:h-2 sm:w-2" />
                            </Button>
                          )}
                        </h4>
                        <p className="text-sm text-muted-foreground break-words">
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
                      <ListX className="h-10 w-10 mb-2" />
                      No Qualifications & Certifications
                    </h4>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Referral Link */}
            {isMyProfile && (
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
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <span className="truncate text-sm text-muted-foreground flex-1">
                      {referralLink ? (
                        <Input
                          type="text"
                          className="w-full"
                          value={referralLink}
                          readOnly
                        />
                      ) : (
                        <Skeleton className="h-8 w-full sm:w-32" />
                      )}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full sm:w-auto mt-2 sm:mt-0"
                      onClick={CopyReferralLink}
                      disabled={!referralLink}
                    >
                      <CopyIcon className="h-4 w-4 mr-2 sm:mr-0" />
                      <span className="sm:hidden">Copy Link</span>
                    </Button>
                  </div>
                </CardContent>
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
