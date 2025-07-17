import { useRouter, useParams } from "next/navigation"

export const usePostNavigation = () => {
  const router = useRouter()
  const params = useParams()

  const navigateToPost = (postId: string, spaceId?: string) => {
    if (spaceId && spaceId !== "shared") {
      const channelSlug = params?.channel_slug as string
      const spaceSlug = params?.space_slug as string
      if (channelSlug && spaceSlug) {
        router.push(
          `/channels/${channelSlug}/spaces/${spaceSlug}?page-type=posts&post-id=${postId}`
        )
      } else {
        router.push(`/posts/${postId}`)
      }
    } else {
      router.push(`/posts/${postId}`)
    }
  }

  return { navigateToPost }
}
