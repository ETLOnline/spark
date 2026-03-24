import { Search } from "lucide-react"
import { Input } from "../../ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../../ui/select"
import { useEffect } from "react"

interface EventsFilterBarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  eventType: "virtual" | "physical" | "hybrid" | "all"
  onEventTypeChange: (value: "virtual" | "physical" | "hybrid" | "all") => void
  eventCategory: string
  onCategoryChange: (value: string) => void
  availableTags: { id: string; name: string }[]
}

const EventsFilterBar = ({
  searchTerm,
  onSearchChange,
  eventType,
  onEventTypeChange,
  eventCategory,
  onCategoryChange,
  availableTags
}: EventsFilterBarProps) => {
  return (
    <div className="flex justify-between  w-full gap-3">
      {/* Search Input */}
      <div className="relative flex-1 ">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search events..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Event Type Select */}
      <Select value={eventType} onValueChange={onEventTypeChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="All Types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="virtual">Virtual</SelectItem>
          <SelectItem value="physical">Physical</SelectItem>
          <SelectItem value="hybrid">Hybrid</SelectItem>
        </SelectContent>
      </Select>

      {/* Event Category Select */}
      <Select value={eventCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tags</SelectItem>
          {availableTags?.map((tag) => (
            <SelectItem key={tag.id} value={tag.id}>
              {tag.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default EventsFilterBar
