import {
  IsPostLikedAction,
  ToggleLikeAction
} from "@/src/server-actions/Post/Post"
import { Button } from "../../ui/button"
import { MessageCircle, Share2, ThumbsUp } from "lucide-react"
import { useServerAction } from "@/src/hooks/useServerAction"
import { useSetAtom } from "jotai"
import { postStore } from "@/src/store/post/postStore"
import { useEffect, useState } from "react"
import { useToast } from "@/src/hooks/use-toast"

type Props = {
  likes: number
  comments: number
  postId: number
}

const PostInteractions: React.FC<Props> = ({ likes, comments, postId }) => {
  const [toggleLikeLoading, toggleLikedPost, toggleLikeError, toggleLike] =
    useServerAction(ToggleLikeAction)
  const [IsPostLikedLoading, IsPostLikeddPost, IsPostLikedError, IsPostLiked] =
    useServerAction(IsPostLikedAction)

  const [isLiked, setIsLiked] = useState<boolean>(false)

  const setPosts = useSetAtom(postStore.posts)

  const { toast } = useToast()

  useEffect(() => {
    ;(async () => {
      setIsLiked((await IsPostLiked(postId))?.data as boolean)
    })()
  }, [])

  const handleLike = async () => {
    try {
      setPosts((posts) =>
        posts.map((post) =>
          post.id === postId
            ? { ...post, likes: isLiked ? post.likes - 1 : post.likes + 1 }
            : post
        )
      )
      const response = await toggleLike(postId, isLiked)
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
        <ThumbsUp className={`mr-2 h-4 w-4 ${isLiked ? "text-primary" : ""}`} />
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
