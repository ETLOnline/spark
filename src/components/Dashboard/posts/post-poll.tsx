import { RadioGroup } from "../../ui/radio-group"
import { Label } from "../../ui/label"
import { RadioGroupItem } from "../../ui/radio-group"
import { SelectPollPost } from "@/src/db/schema"

type Props = {
  post: SelectPollPost
}

const PollPost: React.FC<Props> = ({post}) => {
  return (
    <div>
      <p className="font-semibold mb-2">{post.content}</p>
      <RadioGroup>
        {post.options?.map((option) => (
          <div key={option.option_text} className="flex items-center space-x-2">
            <RadioGroupItem
              value={option.option_text}
              id={option.option_text}
            />
            <Label htmlFor={option.option_text}>{option.option_text}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

export default PollPost
