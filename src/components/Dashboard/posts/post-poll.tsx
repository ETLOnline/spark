import { RadioGroup } from "../../ui/radio-group"
import { Label } from "../../ui/label"
import { RadioGroupItem } from "../../ui/radio-group"
import { SelectComment, SelectPollPost } from "@/src/db/schema"
import { VotePollAction } from "@/src/server-actions/Post/Post"
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

type Props = {
  post: SelectPollPost
}

const PollPost: React.FC<Props> = ({ post }) => {
  const [selectedOption, setSelectedOption] = useState<string>("")

  const setPosts = useSetAtom(postStore.posts)
  const userId = useAtomValue(userStore.AuthUser)?.unique_id

  const [votePollLoading, votePollData, votePollError, votePoll] =
    useServerAction(VotePollAction)

  const { toast } = useToast()

  useEffect(() => {
    if (userId && post.options && post.options.length) {
      const userVote = post.options.find((option) =>
        option.votes?.some((vote) => vote.user_id === userId)
      )
      setSelectedOption(userVote?.option_text || "")
    }
  }, [userId])

  const handleVote = async (value: string) => {
    if (value === selectedOption) {
      return
    }
    try {
      const option = post.options?.find(
        (option) => option.option_text === value
      )
      if (!option) return
      setSelectedOption(value)
      const result = await votePoll(post.id, value, option.vote_count)
      if (result?.success) {
        toast({
          title: "Success",
          description: "You have successfully voted"
        })
        setPosts((posts) =>
          posts.map((p) =>
            p.id === post.id && "options" in p
              ? {
                  ...p,
                  options: p.options.map((option) =>
                    option.option_text === value
                      ? { ...option, vote_count: option.vote_count + 1 }
                      : option
                  )
                }
              : p
          )
        )
      } else {
        throw new Error(result?.error)
      }
    } catch (error) {
      setSelectedOption("")
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error voting please try again!"
      })
    }
  }

  return (
    <>
      <CardContent>
        <p className="font-semibold mb-2">{post.content}</p>
        <RadioGroup
          onValueChange={handleVote}
          disabled={
            votePollLoading ||
            (votePollData?.data?.option.option_text.length as number) > 0 ||
            selectedOption.length > 0
          }
          value={selectedOption}
        >
          {post.options?.map((option) => (
            <div
              key={option.option_text}
              className="flex items-center space-x-2"
            >
              <RadioGroupItem
                value={option.option_text}
                id={option.option_text}
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
        />
        <Separator />
        <div className="w-full space-y-4">
          {post.postComments &&
            post.postComments.map((comment: SelectComment) => (
              <PostComments key={comment.id} comment={comment} />
            ))}
        </div>
        <PostCommentForm postId={post.id} comments={post.comments} />
      </CardFooter>
    </>
  )
}

export default PollPost
