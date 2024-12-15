"use client"

import * as React from "react"
import {
  Calculator,
  Calendar,
  Command,
  CreditCard,
  MessageSquare,
  Search,
  Settings,
  Smile,
  User,
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/src/components/ui/command"
import { Input } from "../../ui/input"
import { useRouter } from "next/navigation"
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import { FindUserWildCard } from "@/src/server-actions/User/FindUserWildCard"
import { SelectUser } from "@/src/db/schema"
import { Avatar, AvatarImage } from "../../ui/avatar"

export function CommandCenter() {
  const [open, setOpen] = React.useState(false)
	const router = useRouter()
	const [inputValue ,  setInputValue] = React.useState<string>('')
	const [peopleList, setPeopleList] = React.useState<SelectUser[]>([])

  React.useEffect(() => {
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

	const handleInputValueChange = useDebouncedCallback(async(value: string) => {
		if (value.trim() === '') {
      setPeopleList([]);
      return;
    }
		const usersRes = await FindUserWildCard(value)
		if(usersRes.success){
			setPeopleList(usersRes.data)
		}
	}, 800)
	
  return (
    <div>
			<div className="flex items-center gap-2">
        <Input size={30} onClick={() => setOpen(true)} placeholder="Press ⌘ + K or click to search" />
			</div>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." onValueChange={value => {handleInputValueChange(value); setInputValue(value)}} />
				
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
					
					<CommandGroup heading="Users" >
						{peopleList.map((person) => (
							<CommandItem value={person.first_name + ' ' + person.last_name} key={person.id} onSelect={()=> handleItemPress(`/profile/${person.unique_id}`)} >
								<Avatar>
									<AvatarImage src={person?.profile_url || ''} alt={person.first_name} />
								</Avatar>
								<span>{person.first_name} {person.last_name}</span>
							</CommandItem>
						))}
					</CommandGroup>
					

          <CommandGroup heading="Suggestions">
            <CommandItem>
              <Calendar />
              <span>Calendar</span>
            </CommandItem>
            <CommandItem>
              <Smile />
              <span>Search Emoji</span>
            </CommandItem>
            <CommandItem>
              <Calculator />
              <span>Calculator</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Quick Links">
            <CommandItem onSelect={()=> handleItemPress('/profile')} >
              <User />
              <span>Profile</span>
            </CommandItem>
            <CommandItem onSelect={()=> handleItemPress('/chat')}>
              <MessageSquare />
              <span>Chat</span>
            </CommandItem>
            <CommandItem>
              <Settings />
              <span>Settings</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  )
}
