import TagsInput from "react-tagsinput"
import "./chips-input.css"
import { Tag } from "../dashboard/Profile/types/profile-types"

type ChipsInputProps = {
  tags: Omit<Tag, "id">[]
  updateTags: (tags: Omit<Tag, "id">[]) => void
}

const ChipsInput: React.FC<ChipsInputProps> = (props) => {
  return (
    <div
      tabIndex={0}
      role="input"
      className="chips-input peer flex h-auto w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:invisible 
             focus-visible:outline-none focus-visible:ring-ring
            focus-within:ring-1 focus-within:ring-black dark:focus-within:ring-white"
    >
      <TagsInput
        value={props.tags.map((tag) => tag.name)}
        onChange={(tags) =>
          props.updateTags([...tags.map((tag) => ({ name: tag }))])
        }
        addOnPaste
        inputProps={{
          className: "react-tagsinput-input",
          placeholder: ""
        }}
      />
    </div>
  )
}

export default ChipsInput
