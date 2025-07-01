import { MoreVertical, Trash } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu"
import { DeletePostAction } from "@/src/server-actions/Post/Post"
import { Button } from "@/src/components/ui/button"
import { useAtom, useAtomValue } from "jotai"
import { postStore } from "@/src/store/post/postStore"
import { useToast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"
import { userStore } from "@/src/store/user/userStore"
import { SelectPost } from "@/src/db/schema"
import { isUserAdmin } from "@/src/utils/helpers"
import { spaceStore } from "@/src/store/space/spaceStore"
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"

interface PostMenuProps {
  post: SelectPost
}

const PostMenu = ({ post }: PostMenuProps) => {
  const [posts, setPosts] = useAtom(postStore.posts)
  const user = useAtomValue(userStore.AuthUser)
  const currSpace = useAtomValue(spaceStore.currentSpace)
  const { permissionChecker } = usePermissionChecker(
    currSpace ? "scoped" : "global",
    "SPACE",
    currSpace?.id
  )

  const canDelete = permissionChecker
    ? permissionChecker?.canAccess("posting.delete")
    : false

  const { toast } = useToast()

  const [deletePostLoading, deletedPost, deletePostError, deletePost] =
    useServerAction(DeletePostAction)

  const handleDelete = async () => {
    try {
      const res = await deletePost(post.id)
      if (res?.success) {
        setPosts(posts.filter((post) => post.id !== post.id))
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

  if (user?.role && (isUserAdmin(user) || user.unique_id === post.user_id)) {
    return (
      <>
        {(canDelete || user.unique_id === post.user_id) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-destructive"
                onClick={handleDelete}
              >
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </>
    )
  } else {
    return null
  }
}

export default PostMenu
