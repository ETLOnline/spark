import { useEffect, useRef, useState } from "react"

export function shouldShowToggle(el: HTMLElement, lines: number = 3): boolean {
  if (!el) return false

  const previousClamp = el.style.webkitLineClamp

  el.style.webkitLineClamp = "unset"

  const fullHeight = el.scrollHeight

  el.style.webkitLineClamp = previousClamp

  const lineHeight = parseFloat(getComputedStyle(el).lineHeight)
  const maxHeight = lineHeight * lines

  return fullHeight > maxHeight
}

export function useExpandableText(lines: number = 3, content: string = "") {
  const contentRef = useRef<HTMLParagraphElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [showToggle, setShowToggle] = useState(false)

  useEffect(() => {
    if (contentRef.current) {
      const shouldShow = shouldShowToggle(contentRef.current, lines)
      setShowToggle(shouldShow)
    }
  }, [content, lines])

  const toggle = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setExpanded((prev) => !prev)
  }

  return {
    contentRef,
    expanded,
    showToggle,
    toggle
  }
}
