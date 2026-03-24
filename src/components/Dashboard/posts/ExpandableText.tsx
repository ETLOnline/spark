import { ChevronDown, ChevronUp } from "lucide-react"
import { useExpandableText } from "@/src/hooks/useExpandableText"
import { Button } from "../../ui/button"

type Props = {
  content: string
  lines?: number
  className?: string
  isHtml?: boolean
}

const ExpandableText: React.FC<Props> = ({
  content,
  lines = 6,
  className,
  isHtml = false
}) => {
  const { contentRef, expanded, showToggle, toggle } = useExpandableText(
    lines,
    content
  )

  const clampStyle: React.CSSProperties | undefined = !expanded
    ? ({
        display: "-webkit-box",
        WebkitLineClamp: String(lines) as any,
        WebkitBoxOrient: "vertical" as any,
        overflow: "hidden"
      } as React.CSSProperties)
    : undefined

  return (
    <>
      {isHtml ? (
        <div
          ref={contentRef}
          style={clampStyle}
          className={`${className ?? ""} whitespace-pre-wrap break-words`}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <p
          ref={contentRef}
          style={clampStyle}
          className={`${className ?? ""} whitespace-pre-wrap break-words`}
        >
          {content}
        </p>
      )}

      {showToggle && (
        <Button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggle()
          }}
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
