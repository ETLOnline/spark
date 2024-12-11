import TagsInput from "react-tagsinput"
import "react-tagsinput/react-tagsinput.css"

type ChipsInputProps = {
  tags: string[]
  updateTags: (tags: string[]) => void
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
        value={props.tags}
        onChange={(tags) => props.updateTags(tags)}
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
