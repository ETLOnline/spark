import { SelectUser } from "@/src/db/schema"
import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react"
import type { KeyboardEvent } from "react"

export interface MentionListHandle {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean
}

const MentionList = forwardRef<MentionListHandle, any>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  const selectItem = (index: number) => {
    const item = props.items[index]
    if (item) {
      props.command({
        id: item.unique_id,
        label: `${item.first_name} ${item.last_name}`,
      })
    }
  }

  const upHandler = () => {
    setHoverIndex(null)
    setSelectedIndex(
      (selectedIndex + props.items.length - 1) % props.items.length
    )
  }

  const downHandler = () => {
    setHoverIndex(null)
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => selectItem(selectedIndex)

  useEffect(() => {
    setSelectedIndex(0)
    setHoverIndex(null)
  }, [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        upHandler()
        return true
      }

      if (event.key === "ArrowDown") {
        downHandler()
        return true
      }

      if (event.key === "Enter") {
        enterHandler()
        return true
      }

      return false
    },
  }))

  return (
    <div className="bg-popover border rounded-lg shadow-lg p-2 w-80 max-h-64 overflow-y-auto z-50">
      {props.items.length ? (
        props.items.map((item: SelectUser, index: number) => {
          const isSelected = index === selectedIndex
          const isHovered = hoverIndex === index

          const className = isSelected
            ? "bg-primary text-primary-foreground"
            : isHovered
            ? "bg-accent text-accent-foreground"
            : "hover:bg-accent hover:text-accent-foreground"

          return (
            <button
              key={item.unique_id}
              onMouseEnter={() => setHoverIndex(index)}
              onMouseLeave={() => setHoverIndex(null)}
              onClick={() => selectItem(index)}
              className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2 transition-colors ${className}`}
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  {item.first_name} {item.last_name}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {item.email}
                </div>
              </div>
            </button>
          )
        })
      ) : (
        <div className="px-3 py-2 text-sm text-muted-foreground">
          No users found
        </div>
      )}
    </div>
  )
})

export default MentionList
