import * as React from "react"

import { cn } from "@/src/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  variant?: "resistive" | "default"
  prefix?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", ...props }, ref) => {
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
    } else
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
