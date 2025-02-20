import { ToggleLikeAction } from "@/src/server-actions/Post/Post"
import { Button } from "../../ui/button"
import { MessageCircle, Share2, ThumbsUp } from "lucide-react"
import { useServerAction } from "@/src/hooks/useServerAction"
import { useAtomValue, useSetAtom } from "jotai"
import { postStore } from "@/src/store/post/postStore"
import { useEffect, useState } from "react"
import { useToast } from "@/src/hooks/use-toast"
import { SelectLike } from "@/src/db/schema"
import { userStore } from "@/src/store/user/userStore"

type Props = {
  likes: number
  comments: number
  postId: string
  likers?: SelectLike[]
}

const PostInteractions: React.FC<Props> = ({
  likes,
  comments,
  postId,
  likers
}) => {
  const [toggleLikeLoading, toggleLikedPost, toggleLikeError, toggleLike] =
    useServerAction(ToggleLikeAction)

  const [isLiked, setIsLiked] = useState<boolean>(false)

  const setPosts = useSetAtom(postStore.posts)
  const userId = useAtomValue(userStore.AuthUser)?.unique_id

  const { toast } = useToast()

  useEffect(() => {
    if (likers && likers?.length && userId) {
      setIsLiked(likers.some((like) => like.user_id === (userId as string)))
    }
  }, [userId])

  const handleLike = async () => {
    try {
      setPosts((posts) =>
        posts.map((post) =>
          post.id === postId
            ? { ...post, likes: isLiked ? post.likes - 1 : post.likes + 1 }
            : post
        )
      )
      const response = await toggleLike(postId, isLiked, likes)
      if (response?.data) {
        setIsLiked(!isLiked)
      }
      if (response?.error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Error liking post please try again!"
        })
        setPosts((posts) =>
          posts.map((post) =>
            post.id === postId
              ? { ...post, likes: isLiked ? post.likes + 1 : post.likes - 1 }
              : post
          )
        )
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error liking post please try again!"
      })
    }
  }

  return (
    <div className="flex justify-between w-full">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        disabled={toggleLikeLoading}
      >
        <ThumbsUp
          className={`mr-2 h-4 w-4 ${
            isLiked
              ? "text-primary dark:text-primary fill-primary dark:fill-white"
              : ""
          }`}
        />
        {likes}
      </Button>
      <Button variant="ghost" size="sm">
        <MessageCircle className="mr-2 h-4 w-4" />
        {comments}
      </Button>
      <Button variant="ghost" size="sm">
        <Share2 className="mr-2 h-4 w-4" />
        Share
      </Button>
    </div>
  )
}

export default PostInteractions
