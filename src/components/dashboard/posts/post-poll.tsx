import { Label } from "@/src/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/src/components/ui/radio-group"

type Props = {
  content: string
  options: string[]
}

const PostPoll: React.FC<Props> = (props) => {
  return (
    <div>
      <p className="font-semibold mb-2">{props.content}</p>
      <RadioGroup>
        {props.options?.map((option) => (
          <div className="flex items-center space-x-2">
            <RadioGroupItem value={option} id={option} />
            <Label htmlFor={option}>{option}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  )
}

export default PostPoll
