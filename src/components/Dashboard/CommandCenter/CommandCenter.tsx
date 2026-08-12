"use client"

import {
  Calculator,
  Calendar,
  Command,
  CreditCard,
  MessageSquare,
  Search,
  Settings,
  Smile,
  User
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut
} from "@/src/components/ui/command"
import { Input } from "../../ui/input"
import { useRouter } from "next/navigation"
import { useDebounce, useDebouncedCallback } from "use-debounce"
import { FindUserWildCardAction } from "@/src/server-actions/User/FindUserWildCardAction"
import { SelectUser } from "@/src/db/schema"
import { Avatar, AvatarImage } from "../../ui/avatar"
import { useServerAction } from "@/src/hooks/useServerAction"
import Loader from "../../common/Loader/Loader"
import { useEffect, useState } from "react"
import { getUserRole } from "@/src/utils/helpers"
import { VerifiedBadge } from "../../ui/verified-badge"

export default function CommandCenter() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const [inputValue, setInputValue] = useState<string>("")
  const [peopleList, setPeopleList] = useState<SelectUser[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [loading, state, error, FindUserWildCard] = useServerAction(
    FindUserWildCardAction
  )

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleItemPress = (path: string) => {
    router.push(path)
    setOpen(false)
  }

  const handleInputValueChange = useDebouncedCallback(async (value: string) => {
    if (value.trim() === "") {
      setPeopleList([])
      setIsTyping(false)
      return
    }
    await FindUserWildCard(value)
    setIsTyping(false)
  }, 800)

  useEffect(() => {
    if (state?.success) {
      setPeopleList(state.data)
    }
  }, [state])

  return (
    <div>
      <div className="flex items-center gap-2">
        <Input
          size={30}
          onClick={() => setOpen(true)}
          placeholder="Press ⌘ + K or click to search"
        />
      </div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Type a command or search..."
          onValueChange={(value) => {
            if (value.trim() !== "") {
              setIsTyping(true)
            } else {
              setIsTyping(false)
              setPeopleList([])
            }
            handleInputValueChange(value)
            setInputValue(value)
          }}
        />

        <CommandList>
          {loading || isTyping ? (
            <div className="w-full flex justify-center p-2">
              <Loader />
            </div>
          ) : (
            <CommandEmpty>No results found.</CommandEmpty>
          )}

          <CommandGroup heading="Users">
            {peopleList.map((person) => (
              <CommandItem
                key={person.unique_id}
                onSelect={() => handleItemPress(`/profile/${person.unique_id}`)}
                className="group"
              >
                <Avatar>
                  <AvatarImage
                    src={person?.profile_url || ""}
                    alt={person.first_name}
                  />
                </Avatar>
                <div className="flex flex-col">
                  <h2 className="flex items-center gap-1">
                    {person.first_name} {person.last_name}
                    {person.profile?.verified && <VerifiedBadge size={14} />}
                  </h2>
                  <p
                    className="text-sm text-muted-foreground
                   
                   group-data-[selected=true]:text-muted"
                  >
                    {getUserRole(person)}
                  </p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />
          <CommandGroup heading="Quick Links">
            <CommandItem onSelect={() => handleItemPress("/profile")}>
              <User />
              <span>Profile</span>
            </CommandItem>
            <CommandItem onSelect={() => handleItemPress("/chat")}>
              <MessageSquare />
              <span>Chat</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  )
}
