import { RadioGroup } from "../../ui/radio-group"
import { Label } from "../../ui/label"
import { RadioGroupItem } from "../../ui/radio-group"
import { Button } from "../../ui/button"
import { SelectComment, SelectPollPost } from "@/src/db/schema"
import { VotePollAction, UpdateCommentAction } from "@/src/server-actions/Post/Post"
import { useEffect, useState } from "react"
import { useServerAction } from "@/src/hooks/useServerAction"
import { useToast } from "@/src/hooks/use-toast"
import { useAtomValue, useSetAtom } from "jotai"
import { postStore } from "@/src/store/post/postStore"
import { userStore } from "@/src/store/user/userStore"
import { CardContent, CardFooter } from "../../ui/card"
import { Badge } from "../../ui/badge"
import PostInteractions from "./post-interactions"
import { Separator } from "@/src/components/ui/separator"
import PostComments from "./post-comments"
import PostCommentForm from "./post-comment-form"
import PostCommentsSection from "./post-comments-section"
import { usePostNavigation } from "@/src/hooks/usePostNavigation"
import Image from "next/image"

type Props = {
  post: SelectPollPost
  spaceId?: string
}

const PollPost: React.FC<Props> = ({ post, spaceId }) => {
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [tempSelectedOption, setTempSelectedOption] = useState<string>("")
  const [hasVoted, setHasVoted] = useState<boolean>(false)
  const [editingComment, setEditingComment] = useState<SelectComment | null>(null)
  const { navigateToPost } = usePostNavigation()

  const setPosts = useSetAtom(postStore.posts)
  const userId = useAtomValue(userStore.AuthUser)?.unique_id

  const [votePollLoading, votePollData, votePollError, votePoll] =
    useServerAction(VotePollAction)

  const [updateCommentLoading, updatedComment, updateCommentError, updateComment] =
    useServerAction(UpdateCommentAction)

  const { toast } = useToast()

  const handleContentClick = () => {
    navigateToPost(post.id, spaceId)
  }

  useEffect(() => {
    if (userId && post.options && post.options.length) {
      const userVote = post.options.find((option) =>
        option.votes?.some((vote) => vote.user_id === userId)
      )
      if (userVote) {
        setSelectedOption(userVote.option_text)
        setTempSelectedOption(userVote.option_text)
        setHasVoted(true)
      }
    }
  }, [userId, post.options])

  const handleOptionChange = (value: string) => {
    setTempSelectedOption(value)
  }

  const handleSubmitVote = async () => {
    if (!tempSelectedOption) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select an option"
      })
      return
    }

    try {
      const option = post.options?.find(
        (option) => option.option_text === tempSelectedOption
      )
      if (!option) return

      const result = await votePoll(
        post.id,
        tempSelectedOption,
        option.vote_count
      )
      if (result?.success) {
        setSelectedOption(tempSelectedOption)
        setHasVoted(true)
        toast({
          title: "Success",
          description: "You have successfully voted"
        })
        setPosts((posts) =>
          posts.map((p) =>
            p.id === post.id && "options" in p
              ? {
                  ...p,
                  options: p.options?.map((opt) =>
                    opt.option_text === tempSelectedOption
                      ? { ...opt, vote_count: opt.vote_count + 1 }
                      : opt
                  )
                }
              : p
          )
        )
      } else {
        throw new Error(result?.error)
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error voting please try again!"
      })
    }
  }

  const handleEditComment = (comment: SelectComment) => {
    setEditingComment(comment)
  }

  const handleCancelEdit = () => {
    setEditingComment(null)
  }

  const handleUpdateComment = async (commentId: number, newContent: string) => {
    try {
      const response = await updateComment(commentId, newContent)
      if (response?.data) {
        setPosts((posts) =>
          posts.map((p) =>
            p.id === post.id
              ? {
                  ...p,
                  postComments: (p.postComments as SelectComment[]).map((c) =>
                    c.id === commentId ? { ...c, content: newContent } : c
                  )
                }
              : p
          )
        )
        toast({
          title: "Comment updated",
          description: "Your comment has been updated successfully"
        })
        setEditingComment(null)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Error updating comment please try again!"
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error updating comment please try again!"
      })
    }
  }

  const isSingle = post.files?.length === 1
  return (
    <>
      <CardContent
        className={spaceId !== undefined ? "cursor-pointer" : ""}
        onClick={spaceId !== undefined ? handleContentClick : undefined}
      >
        {post.category && (
          <Badge variant="outline" className="mb-2">
            {post.category}
          </Badge>
        )}
        <p className="font-semibold mb-4">{post.content}</p>
        {post.files && post.files.length > 0 && (
          <div
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className="mb-4 grid  gap-2 sm:grid-cols-3"
          >
            {post.files.map((file) => (
              <div
                key={file.id}
                className="relative overflow-hidden rounded-lg"
              >
                <Image
                  src={file.file_path}
                  alt={file.file_name}
                  width={isSingle ? 1200 : 600}
                  height={isSingle ? 700 : 350}
                  className="h-32 w-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
        <div onClick={(e) => e.stopPropagation()}>
          <RadioGroup
            onValueChange={handleOptionChange}
            disabled={votePollLoading || hasVoted}
            value={tempSelectedOption}
          >
            {post.options?.map((option) => (
              <div
                key={option.option_text}
                className="flex items-center space-x-2"
              >
                <RadioGroupItem
                  value={option.option_text}
                  id={option.option_text}
                  disabled={votePollLoading || hasVoted}
                />
                <Label htmlFor={option.option_text}>
                  {option.option_text}
                  {option.vote_count > 0 && (
                    <span className="ml-2 text-sm text-gray-500">
                      ({option.vote_count} votes)
                    </span>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
          {!hasVoted && tempSelectedOption && (
            <Button
              onClick={handleSubmitVote}
              disabled={votePollLoading}
              className="mt-4"
            >
              {votePollLoading ? "Voting..." : "Cast Vote"}
            </Button>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {post.hashtags &&
            post.hashtags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                #{tag.name}
              </Badge>
            ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start space-y-4">
        <PostInteractions
          postId={post.id}
          likes={post.likes}
          comments={post.comments}
          likers={post.postLikes}
          spaceId={spaceId}
        />
        <Separator />
        <PostCommentsSection
          comments={post.postComments || []}
          onEditComment={handleEditComment}
        />
        <PostCommentForm
          postId={post.id}
          comments={post.comments}
          spaceId={spaceId}
          editingComment={editingComment}
          onCancelEdit={handleCancelEdit}
          onUpdateComment={handleUpdateComment}
        />
      </CardFooter>
    </>
  )
}

export default PollPost