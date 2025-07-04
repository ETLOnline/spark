import { Search } from "lucide-react"
import { Input } from "@/src/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/src/components/ui/select"
import {
  CommunityCategory,
  SortByOptions
} from "@/src/db/data-access/communities/query"

interface CommunitiesFilterBarProps {
  searchTerm: string
  selectedCategory: string
  sortBy: SortByOptions
  onSearchChange: (value: string) => void
  onCategoryChange: (value: string) => void
  onSortByChange: (value: SortByOptions) => void
  availableCategories: CommunityCategory[]
}

export default function CommunitiesFilterBar({
  searchTerm,
  selectedCategory,
  sortBy,
  onSearchChange,
  onCategoryChange,
  onSortByChange,
  availableCategories
}: CommunitiesFilterBarProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search communities..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {availableCategories &&
            availableCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      <Select value={sortBy} onValueChange={onSortByChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="titleAsc">Title (A-Z)</SelectItem>
          <SelectItem value="titleDesc">Title (Z-A)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
