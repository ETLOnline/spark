"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Label } from "@/src/components/ui/label"
import { SearchableSingleSelect } from "@/src/components/ui/searchable-single-select"
import { SelectUser } from "@/src/db/schema"

interface UserType {
  first_name?: string
  last_name?: string
  profile_url?: string
  unique_id?: string
}

interface OptionType {
  label: string
  value: string
}

interface Props {
  label: string
  value?: string
  user: SelectUser | null
  options: OptionType[]
  activeField: string | null
  fieldKey: string
  setActiveField: (val: string | null) => void
  disabled?: boolean
  placeholder?: string
  onChange: (val: string) => void
}

export default function UserSelector({
  label,
  value,
  user,
  options,
  activeField,
  fieldKey,
  setActiveField,
  disabled,
  placeholder = "Select Option",
  onChange
}: Props) {
  const isActive = activeField === fieldKey

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {isActive ? (
        <SearchableSingleSelect
          id={`${fieldKey}_input`}
          options={options}
          value={value}
          disabled={disabled}
          onChange={(val) => {
            onChange(val)
            setActiveField(null)
          }}
          placeholder={placeholder}
        />
      ) : (
        <div
          className="py-2 cursor-pointer flex items-center gap-2"
          onClick={() => !disabled && setActiveField(fieldKey)}
        >
          <Avatar className="h-5 w-5">
            <AvatarImage
              src={user?.profile_url || "/placeholder.svg"}
              alt={user?.first_name}
            />
            <AvatarFallback className="text-xs">
              {user?.first_name?.[0]}
              {user?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>

          <span className={!user ? "text-muted-foreground" : ""}>
            {user ? `${user.first_name} ${user.last_name}` : placeholder}
          </span>
        </div>
      )}
    </div>
  )
}
