import { useEffect, useRef, useState } from "react"

export function shouldShowToggle(el: HTMLElement, lines: number = 3): boolean {
  if (!el) return false

  // Temporarily remove any clamp-related inline styles so we can measure
  const previousClamp = el.style.webkitLineClamp
  const previousOverflow = el.style.overflow
  const previousDisplay = el.style.display
  const previousBoxOrient = (el.style as any).webkitBoxOrient

  el.style.webkitLineClamp = "unset"
  el.style.overflow = "visible"
  el.style.display = "block"
  ;(el.style as any).webkitBoxOrient = "unset"

  const fullHeight = el.scrollHeight

  // Restore previous inline styles
  el.style.webkitLineClamp = previousClamp
  el.style.overflow = previousOverflow
  el.style.display = previousDisplay
  ;(el.style as any).webkitBoxOrient = previousBoxOrient

  // Compute line height; if it's not a pixel value (e.g. 'normal'), fall back
  let lineHeight = parseFloat(getComputedStyle(el).lineHeight)
  if (Number.isNaN(lineHeight) || lineHeight <= 0) {
    // Create a temporary inline element to measure a single-line height
    const span = document.createElement("span")
    span.style.visibility = "hidden"
    span.style.whiteSpace = "nowrap"
    span.textContent = "A"
    el.appendChild(span)
    lineHeight = span.getBoundingClientRect().height
    el.removeChild(span)
  }

  const maxHeight = lineHeight * lines

  return fullHeight > maxHeight
}

export function useExpandableText(lines: number = 3, content: string = "") {
  const contentRef = useRef<HTMLParagraphElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [showToggle, setShowToggle] = useState(false)

  // useLayoutEffect so measurements happen before paint and stay consistent
  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    const update = () => {
      const shouldShow = shouldShowToggle(el, lines)
      setShowToggle(shouldShow)
    }

    update()

    // Recalculate on resize and content size changes (helps when images load)
    const ro = new ResizeObserver(update)
    ro.observe(el)

    const onResize = () => update()
    window.addEventListener("resize", onResize)

    return () => {
      ro.disconnect()
      window.removeEventListener("resize", onResize)
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
