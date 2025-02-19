import { RadioGroup } from "../../ui/radio-group"
import { Label } from "../../ui/label"
import { RadioGroupItem } from "../../ui/radio-group"
import { SelectPollPost } from "@/src/db/schema"
import {
  HasUserVotedAction,
  VotePollAction
} from "@/src/server-actions/Post/Post"
import { useEffect, useState } from "react"
import { useServerAction } from "@/src/hooks/useServerAction"
import { useToast } from "@/src/hooks/use-toast"
import { useSetAtom } from "jotai"
import { postStore } from "@/src/store/post/postStore"

type Props = {
  post: SelectPollPost
}

const PollPost: React.FC<Props> = ({ post }) => {
  const [selectedOption, setSelectedOption] = useState<string>("")

  const setPosts = useSetAtom(postStore.posts)

  const [votePollLoading, votePollData, votePollError, votePoll] =
    useServerAction(VotePollAction)
  const [
    hasUserVotedLoading,
    hasUserVotedData,
    hasUserVotedError,
    hasUserVoted
  ] = useServerAction(HasUserVotedAction)

  const { toast } = useToast()

  useEffect(() => {
    ;(async () => {
      try {
        const userVote = await hasUserVoted(post.id)
        setSelectedOption(userVote?.data?.option_text || "")
      } catch (error) {
        console.error(error)
      }
    })()
  }, [])

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
    <div>
      <p className="font-semibold mb-2">{post.content}</p>
      <RadioGroup
        onValueChange={handleVote}
        disabled={
          votePollLoading ||
          (hasUserVotedData?.data?.option_text.length as number) > 0 ||
          (votePollData?.data?.option.option_text.length as number) > 0
        }
        value={selectedOption}
      >
        {post.options?.map((option) => (
          <div key={option.option_text} className="flex items-center space-x-2">
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
    </div>
  )
}

export default PollPost
