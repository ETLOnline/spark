"use client"

import * as React from "react"
import { Check, Loader2, Search } from "lucide-react"
import { cn } from "@/src/lib/utils"
import { Button } from "@/src/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from "@/src/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/src/components/ui/popover"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import Loader from "../common/Loader/Loader"
import { LoaderSizes } from "../common/types/loader-types"

export type SelectOption = { label: string; value: string }

interface SearchableSingleSelectProps {
  options: SelectOption[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
  onQueryChange?: (query: string) => void
  loading?: boolean
}

export const SearchableSingleSelect = React.forwardRef<
  HTMLButtonElement,
  SearchableSingleSelectProps
>(
  (
    {
      options,
      value,
      onChange,
      placeholder = "Select option...",
      disabled = false,
      className,
      id,
      onQueryChange,
      loading = false
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const isServerSearch = typeof onQueryChange === "function"

    React.useEffect(() => {
      setOpen(true)
    }, [])

    const selectedOption = options.find((option) => option.value === value)

    const handleQueryChange = (next: string) => {
      setQuery(next)
      onQueryChange?.(next)
    }

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between font-normal", className)}
            disabled={disabled}
          >
            <span className="truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        {/* Use portal to ensure it renders outside the Sidebar scroll area */}
        <PopoverContent
          className="w-[220px] p-0 z-[100]"
          align="start"
          side="bottom"
        >
          <Command shouldFilter={!isServerSearch}>
            <CommandInput
              placeholder="Search..."
              value={query}
              onValueChange={handleQueryChange}
            />
            {!loading && options.length === 0 && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
            <CommandGroup>
              <ScrollArea
                className="max-h-[200px]"
                onWheel={(e) => {
                  const el = e.currentTarget as HTMLDivElement
                  el.scrollTop += e.deltaY
                }}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
                    <Loader size={LoaderSizes.sm} />
                    Loading...
                  </div>
                ) : (
                  options.map((option, index) => (
                    <CommandItem
                      key={option.value}
                      value={option.label}
                      onSelect={() => {
                        onChange(option.value)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === option.value ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))
                )}
              </ScrollArea>
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    )
  }
)

SearchableSingleSelect.displayName = "SearchableSingleSelect"
