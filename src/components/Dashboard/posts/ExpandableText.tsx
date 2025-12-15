import { ChevronDown, ChevronUp } from "lucide-react"
import { useExpandableText } from "@/src/hooks/useExpandableText"
import { Button } from "../../ui/button"

type Props = {
  content: string
  lines: number
  className?: string
}

const ExpandableText: React.FC<Props> = ({ content, lines, className }) => {
  const { contentRef, expanded, showToggle, toggle } = useExpandableText(
    lines,
    content
  )

  return (
    <>
      <p
        ref={contentRef}
        className={`${className ?? ""} text-justify whitespace-pre-wrap break-words ${
          expanded ? "" : `line-clamp-${lines}`
        }`}
      >
        {content}
      </p>

      {showToggle && (
        <Button
          onClick={toggle}
          variant="ghost"
          size="sm"
          className="font-medium rounded-full flex items-center gap-1 mx-auto mt-1"
        >
          {expanded ? "Show Less" : "Read More"}
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </Button>
      )}
    </>
  )
}

export default ExpandableText
