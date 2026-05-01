import {
  MapPin,
  Briefcase,
  Calendar,
  LinkIcon,
  PencilIcon,
  MailIcon
} from "lucide-react"
import EditProfileModal from "./edit-profile-modal"
import { TooltipProvider } from "@radix-ui/react-tooltip"
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar"
import { Button } from "../../ui/button"
import { useRef } from "react"
import ExpandableText from "../posts/ExpandableText"
import ProfileFollowActions from "./user/ProfileFollowActions"
import { SelectUser } from "@/src/db/schema"
import { getUserRole } from "@/src/utils/helpers"
import { Skeleton } from "../../ui/skeleton"

type ProfileCardProps = {
  userInfo: SelectUser
  handleCopyUrl?: () => void
  onUploadingChange?: (uploading: boolean) => void
  currentImageUrl?: string | null
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  isMyProfile?: boolean
}

export default function UserProfileCard({
  userInfo,
  handleCopyUrl,
  currentImageUrl,
  onFileChange,
  isMyProfile
}: ProfileCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="rounded-xl border bg-card backdrop-blur p-4 sm:p-6 shadow-lg">
      <div className="flex flex-row gap-4 sm:gap-6 items-start">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-3 shrink-0">
          <div className="relative">
            <Avatar className="h-20 w-20 sm:h-28 sm:w-28 border-2 sm:border-4 border-black rounded-full">
              <AvatarImage
                src={
                  currentImageUrl ||
                  userInfo.profile_url ||
                  "/default-avatar.png"
                }
                alt="Profile"
                className="object-cover"
              />
              <AvatarFallback>IMG</AvatarFallback>
            </Avatar>
            {isMyProfile ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 sm:bottom-1 sm:-right-1 h-6 w-6 sm:h-8 sm:w-8 rounded-full p-0 hover:bg-gray-900 hover:border-gray-900 hover:shadow-xl transition-all duration-200 group"
              >
                <PencilIcon className="h-3 w-3 sm:h-4 sm:w-4 group-hover:text-white transition-colors duration-200" />
              </Button>
            ) : null}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />
          </div>

          <div>
            {isMyProfile === undefined ? (
              <Skeleton className="h-6 w-24" />
            ) : isMyProfile ? (
              <EditProfileModal />
            ) : (
              <ProfileFollowActions user={userInfo} />
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex-1 min-w-0 text-left">
          <div className="mb-2">
            <div className="flex flex-row items-center gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white truncate">
                {userInfo.first_name} {userInfo.last_name}
              </h1>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 sm:h-10 sm:w-10 shrink-0"
                      onClick={handleCopyUrl}
                    >
                      <LinkIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy profile URL</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {userInfo.email && (
              <p className="flex items-start sm:items-center gap-1.5 text-xs sm:text-sm text-muted-foreground mt-1 break-all sm:break-normal">
                <MailIcon className="h-3.5 w-3.5 flex-shrink-0" />
                {userInfo.email}
              </p>
            )}
            <p className="text-xs sm:text-sm font-medium text-teal-600 dark:text-teal-400 mt-1 truncate">
              {getUserRole(userInfo)}
            </p>
          </div>

          <ExpandableText
            content={
              userInfo.profile?.bio || "This user hasn't added a bio yet."
            }
            lines={2}
            className="mb-2 text-xs sm:text-sm leading-relaxed text-gray-600 dark:text-gray-300 text-left"
          />
        </div>
      </div>
    </div>
  )
}
