"use client"
import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { cn } from "@/src/lib/utils"

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> & {
    preserveKey?: string
  }
>(({ className, children, preserveKey, ...props }, ref) => {
  const viewportRef = React.useRef<HTMLDivElement | null>(null)

  const storageKey = React.useMemo(() => {
    if (preserveKey) return `scroll:${preserveKey}`
    if (typeof window === "undefined") return `scroll:unknown`
    return `scroll:${window.location.pathname}${window.location.search}`
  }, [preserveKey])

  const lastSavedRef = React.useRef<{ top: number; left: number } | null>(null)
  const saveTimeoutRef = React.useRef<number | null>(null)

  // restore on mount (after paint)
  React.useEffect(() => {
    try {
      const raw = sessionStorage.getItem(storageKey)
      if (raw && viewportRef.current) {
        const { top = 0, left = 0 } = JSON.parse(raw)
        window.requestAnimationFrame(() => {
          setTimeout(() => {
            if (viewportRef.current) {
              viewportRef.current.scrollTop = top
              viewportRef.current.scrollLeft = left
              lastSavedRef.current = { top, left }
            }
          }, 0)
        })
      }
    } catch {
      // ignore
    }
    // run only on mount/storageKey
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  // flush/save on unmount but avoid saving transient 0/0 that would overwrite a good value
  React.useEffect(() => {
    return () => {
      try {
        if (saveTimeoutRef.current) {
          window.clearTimeout(saveTimeoutRef.current)
          saveTimeoutRef.current = null
        }
        if (!viewportRef.current) return
        const top = viewportRef.current.scrollTop
        const left = viewportRef.current.scrollLeft
        const prev = lastSavedRef.current
        if (prev === null && top === 0 && left === 0) return
        if (prev && prev.top === top && prev.left === left) return
        sessionStorage.setItem(storageKey, JSON.stringify({ top, left }))
        lastSavedRef.current = { top, left }
      } catch {
        // ignore
      }
    }
  }, [storageKey])

  const handleScroll = React.useCallback(() => {
    try {
      if (!viewportRef.current) return
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current)
      }
      saveTimeoutRef.current = window.setTimeout(() => {
        try {
          if (!viewportRef.current) return
          const top = viewportRef.current.scrollTop
          const left = viewportRef.current.scrollLeft
          sessionStorage.setItem(storageKey, JSON.stringify({ top, left }))
          lastSavedRef.current = { top, left }
        } catch {
          // ignore
        }
      }, 120) as unknown as number
    } catch {
      // ignore
    }
  }, [storageKey])

  return (
    <ScrollAreaPrimitive.Root
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        data-scrollable="true"
        className="h-full w-full rounded-[inherit]"
        onScroll={handleScroll}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>

      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
})
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(
      "flex touch-none select-none transition-colors",
      orientation === "vertical" &&
        "h-full w-2.5 border-l border-l-transparent p-[1px]",
      orientation === "horizontal" &&
        "h-2.5 flex-col border-t border-t-transparent p-[1px]",
      className
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
))
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName

export { ScrollArea, ScrollBar }
