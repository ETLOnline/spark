import { MoreVertical, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu"
import { DeletePostAction } from "@/src/server-actions/Post/Post"
import { Button } from "@/src/components/ui/button"
import { useAtom } from "jotai"
import { postStore } from "@/src/store/post/postStore"
import { useToast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"

interface PostMenuProps {
  postId: string
}

const PostMenu = ({ postId }: PostMenuProps) => {
  const [posts, setPosts] = useAtom(postStore.posts)

  const { toast } = useToast()

  const [deletePostLoading, deletedPost, deletePostError, deletePost] =
    useServerAction(DeletePostAction)

  const handleDelete = async () => {
    try {
      const res = await deletePost(postId)
      if (res?.success) {
        setPosts(posts.filter((post) => post.id !== postId))
        toast({
          title: "Post deleted!",
          duration: 3000
        })
      } else {
        throw new Error(res?.error)
      }
    } catch (error) {
      toast({
        title: "Failed to delete post!",
        variant: "destructive",
        duration: 3000
      })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
          <Button variant="ghost" size="sm">
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default PostMenu
