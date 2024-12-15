import * as React from "react"

import { cn } from "@/src/lib/utils"
import { Label } from "./label"

const InputAnimated = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    props.placeholder = props.title
    return (
      <div className="w-full mt-4 relative">
        <input
          type={type}
          className={cn(
            "peer flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:invisible focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          ref={ref}
          {...props}
        />
        {
          props.placeholder && (

            <Label
              data-for={props.id}
              className=" pointer-events-none absolute left-[8px] top-[-8px] bg-white dark:bg-inherit pl-1 pr-1 text-gray-500 transition-all duration-200 ease-in-out  peer-placeholder-shown:top-[10px] peer-placeholder-shown:text-gray-500 peer-focus:top-[-8px] peer-focus:bg-white dark:peer-focus:bg-black "
            >
              {props.placeholder}
            </Label>
          )
        }
      </div>
    )
  }
)
InputAnimated.displayName = "InputAnimated"

export { InputAnimated }
