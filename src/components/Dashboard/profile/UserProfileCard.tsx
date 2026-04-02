import { MapPin, Briefcase, Calendar, LinkIcon, PencilIcon } from "lucide-react"
import EditProfileModal from "./edit-profile-modal"
import { TooltipProvider } from "@radix-ui/react-tooltip"
import { Tooltip, TooltipContent, TooltipTrigger } from "../../ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "../../ui/avatar"
import { Button } from "../../ui/button"
import { useRef, useState, useEffect } from "react"
import { useToast } from "@/src/hooks/use-toast"
import { UpdateUserProfilePictureAction } from "@/src/server-actions/User/User"
import { useServerAction } from "@/src/hooks/useServerAction"
import { useUser } from "@clerk/nextjs"

type AboutSectionProps = {
  userInfo: {
    userFirstName: string
    userLastName: string
    userEmail: string
    userProfileUrl: string | null
    userBio: string | null | undefined
    userRole: string[] | undefined
  }
  handleCopyUrl?: () => void
  onUploadingChange?: (uploading: boolean) => void
}

export default function UserProfileCard({
  userInfo,
  handleCopyUrl,
  onUploadingChange
}: AboutSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState(
    userInfo.userProfileUrl
  )
  const { toast } = useToast()
  const { user: clerkUser } = useUser()
  const [loading, userData, error, updateUserProfile] = useServerAction(
    UpdateUserProfilePictureAction
  )

  // Notify parent when uploading state changes
  useEffect(() => {
    onUploadingChange?.(uploading)
  }, [uploading, onUploadingChange])

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
    <div className="rounded-xl border border-white/20 bg-white/95 dark:bg-slate-900/95 backdrop-blur p-6 shadow-lg">
      <div className="flex gap-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative">
            <Avatar className="h-28 w-28 border-4 border-black rounded-full">
              <AvatarImage
                src={currentImageUrl || "/default-avatar.png"}
                alt="Profile"
                className="object-cover"
              />
              <AvatarFallback>IMG</AvatarFallback>
            </Avatar>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-1 -right-1 h-6 w-6 rounded-full p-0  hover:bg-gray-900 hover:border-gray-900 hover:shadow-xl transition-all duration-200 group"
            >
              <PencilIcon className="h-4 w-4  group-hover:text-white transition-colors duration-200" />
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <EditProfileModal />
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          <div className="mb-2">
            <div className="flex ">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {userInfo.userFirstName} {userInfo.userLastName}
              </h1>
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

            <p className="text-sm font-medium text-teal-600 dark:text-teal-400">
              {userInfo.userRole}
            </p>
          </div>

          <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
            {userInfo.userBio || "This user hasn't added a bio yet."}
          </p>

          <div className="mb-4 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>Islamabad, Pakistan</span>
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>ETL Consulting</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              <span>Joined Jan 2023</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
