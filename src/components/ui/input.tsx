"use client"
import * as React from "react"
import { useRef, useState } from "react"

import { cn } from "@/src/lib/utils"

export interface InputProps extends React.ComponentProps<"input"> {
  variant?: "resistive" | "default"
  prefix?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement | null>(null)
    const [fileName, setFileName] = useState<string>("")

    if (type === "file") {
      const { onChange, ...rest } = props

      const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
          setFileName(file.name)
        } else {
          setFileName("")
        }
        if (onChange) {
          onChange(e)
        }
      }

      return (
        <label
          className={cn(
            "relative w-full cursor-pointer rounded-md border border-input bg-transparent shadow-sm flex items-center justify-between"
          )}
        >
          <input
            type="file"
            className="sr-only"
            ref={(el) => {
              inputRef.current = el
              if (typeof ref === "function") {
                ref(el)
              } else if (ref) {
                ref.current = el
              }
            }}
            onChange={handleFileChange}
            {...rest}
          />
          <span className="px-3 py-1.5 text-sm truncate">
            {fileName || "Choose File"}
          </span>
        </label>
      )
    }

    if (variant === "resistive") {
      return (
        <div className="w-full flex h-9 rounded-md border border-input shadow-sm">
          <div className="w-fit max-w-[150px] flex items-center px-2 text-muted-foreground bg-muted overflow-hidden">
            <span className="truncate">{props.prefix}</span>
          </div>
          <input
            type={type}
            className={cn(
              "flex-1 rounded-r-md bg-transparent px-3 py-1 text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm border-0",
              className
            )}
            ref={ref}
            {...props}
          />
        </div>
      )
    }

    // Default input
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
