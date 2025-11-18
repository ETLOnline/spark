import { useState } from "react"
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@/src/components/ui/popover"
import { Button } from "@/src/components/ui/button"
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandEmpty
} from "@/src/components/ui/command"
import { Checkbox } from "@/src/components/ui/checkbox"
import Loader from "../common/Loader/Loader"
import { Textarea } from "./textarea"
import { Badge } from "./badge"
import { CircleMinus, Cross, CrossIcon } from "lucide-react"

export type MultiSelectOption = { label: string; value: string }

interface MultiSelectProps {
  selected: MultiSelectOption[]
  onChange: (values: MultiSelectOption[]) => void
  options: MultiSelectOption[]
  onQueryChange?: (query: string) => void
  placeholder?: string
  className?: string
  loading?: boolean
  shouldFilter?: boolean
  disabled?: boolean
}

export default function MultiSelect({
  selected,
  onChange,
  options,
  onQueryChange,
  placeholder = "Select options",
  className,
  loading = false,
  shouldFilter = true,
  disabled = false
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const selectedValues = selected.map((s) => s.value)

  const handleQueryChange = (val: string) => {
    setQuery(val)
    onQueryChange?.(val)
  }

  const toggleOption = (option: MultiSelectOption) => {
    const exists = selectedValues.includes(option.value)
    if (exists) {
      onChange(selected.filter((s) => s.value !== option.value))
    } else {
      onChange([...selected, option])
    }
  }

  const hasAnySelected = selectedValues.length > 0

  const selectAll = () => {
    onChange([...options])
  }

  const deselectAll = () => {
    onChange([])
  }

  return (
    <>
      {selected.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 py-2">
          {selected.map((o) => (
            <Badge key={o.value} variant="default">
              {o.label}{" "}
              <CircleMinus
                className="cursor-pointer"
                height={11}
                onClick={() => toggleOption(o)}
              />{" "}
            </Badge>
          ))}
        </div>
      ) : null}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={className ?? "w-full justify-start "}
            disabled={disabled}
          >
            {placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0">
          <Command shouldFilter={shouldFilter}>
            <CommandInput
              placeholder="Search..."
              value={query}
              onValueChange={handleQueryChange}
            />

            {loading ? (
              <div className="w-full flex justify-center p-2">
                <Loader />
              </div>
            ) : null}
            {!loading && options.length === 0 && query.length > 0 && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
            {options.length > 0 && (
              <CommandGroup>
                {hasAnySelected ? (
                  <CommandItem
                    onSelect={deselectAll}
                    className="text-muted-foreground"
                  >
                    <Checkbox checked={hasAnySelected} className="mr-2" />
                    Deselect All
                  </CommandItem>
                ) : (
                  <CommandItem
                    onSelect={selectAll}
                    className="text-muted-foreground"
                  >
                    <Checkbox checked={false} className="mr-2" />
                    Select All
                  </CommandItem>
                )}
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => toggleOption(option)}
                  >
                    <Checkbox
                      checked={selectedValues.includes(option.value)}
                      onCheckedChange={() => toggleOption(option)}
                      className="mr-2"
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </>
  )
}
