import { Edit3, MoreVertical, Trash } from "lucide-react"
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
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import UpdatePostModal from "./updatePostModal"
import { useState } from "react"

interface PostMenuProps {
  post: SelectPost
  spaceId?: string
}

const PostMenu = ({ post, spaceId }: PostMenuProps) => {
  const [posts, setPosts] = useAtom(postStore.posts)
  const user = useAtomValue(userStore.AuthUser)
  const { permissionChecker } = usePermissionChecker(
    spaceId ? "scoped" : "global",
    "SPACE",
    spaceId
  )

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const permissionNamespaceCreate = spaceId
    ? "space.posting.delete"
    : "posting.delete"

  const canDelete = permissionChecker
    ? permissionChecker?.canAccess(permissionNamespaceCreate)
    : false

  const isPostOwner = user?.unique_id === post.user_id
  const shouldShowDeleteButton = canDelete || isPostOwner

  const { toast } = useToast()

  const [deletePostLoading, deletedPost, deletePostError, deletePost] =
    useServerAction(DeletePostAction)

  const handleDelete = async () => {
    try {
      const res = await deletePost(post.id)
      if (res?.success) {
        setPosts((prevPosts) => prevPosts.filter((p) => p.id !== post.id))
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

  if (shouldShowDeleteButton) {
    return (
      <>
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
            {isPostOwner ? (
              <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                <Edit3 className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>

        <UpdatePostModal
          selectedPost={post}
          openDialog={isEditModalOpen}
          setOpenDialog={setIsEditModalOpen}
        />
      </>
    )
  } else {
    // If no permission, return null (don't render anything)
    return null
  }
}

export default PostMenu
