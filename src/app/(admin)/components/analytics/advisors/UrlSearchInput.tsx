"use client"

import { useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { useDebouncedCallback } from "use-debounce"
import { Input } from "@/src/components/ui/input"
import { cn } from "@/src/lib/utils"

interface UrlSearchInputProps {
  placeholder: string
  label: string
  className?: string
}

/** Search box kept in the `?search=` URL param; typing resets to page 1. */
export function UrlSearchInput({
  placeholder,
  label,
  className
}: UrlSearchInputProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [value, setValue] = useState(searchParams.get("search") ?? "")

  const pushSearch = useDebouncedCallback((next: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (next.trim()) params.set("search", next.trim())
    else params.delete("search")
    params.delete("page")
    router.replace(`${pathname}?${params.toString()}`)
  }, 400)

  return (
    <div className={cn("relative w-full sm:max-w-sm", className)}>
      <Search
        aria-hidden="true"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
      />
      <Input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          pushSearch(e.target.value)
        }}
        className="pl-9"
      />
    </div>
  )
}
