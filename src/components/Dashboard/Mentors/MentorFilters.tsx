"use client"

import { useState } from "react"
import { Filter } from "lucide-react"
import moment from "moment"
import { Button } from "@/src/components/ui/button"
import { Label } from "@/src/components/ui/label"
import { Input } from "@/src/components/ui/input"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger
} from "@/src/components/ui/drawer"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/src/components/ui/select"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import MultiSelect, {
  MultiSelectOption
} from "@/src/components/ui/multi-select"
import {
  EngagementType,
  AvailabilityRange,
  MentorFiltersType,
  DEFAULT_FILTERS,
  SKILL_OPTIONS,
  ENGAGEMENT_TYPE_OPTIONS
} from "./mentorsData"

export type { MentorFiltersType }

interface Props {
  onApplyFilters: (filters: MentorFiltersType) => void
}

const TODAY = moment().format("YYYY-MM-DD")

export default function MentorFilters({ onApplyFilters }: Props) {
  const [skills, setSkills] = useState<MultiSelectOption[]>([])
  const [availFrom, setAvailFrom] = useState("")
  const [availTo, setAvailTo] = useState("")
  const [minRating, setMinRating] = useState("0")
  const [engagementTypes, setEngagementTypes] = useState<MultiSelectOption[]>(
    []
  )

  function applyFilters() {
    const availability: AvailabilityRange | undefined =
      availFrom || availTo ? { from: availFrom, to: availTo } : undefined

    onApplyFilters({
      skills: skills.map((s) => s.value),
      availability,
      minRating: Number(minRating),
      engagementTypes: engagementTypes.map((e) => e.value) as EngagementType[]
    })
  }

  function clearFilters() {
    setSkills([])
    setAvailFrom("")
    setAvailTo("")
    setMinRating("0")
    setEngagementTypes([])
    onApplyFilters(DEFAULT_FILTERS)
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-full gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <ScrollArea className="max-h-[80dvh] overflow-y-auto">
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle>Filter Mentors</DrawerTitle>
              <DrawerDescription>
                Filter by skills, availability, rating, and engagement type.
              </DrawerDescription>
            </DrawerHeader>

            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Skills / Expertise</Label>
                <MultiSelect
                  options={SKILL_OPTIONS}
                  selected={skills}
                  onChange={setSkills}
                  placeholder="Select skills"
                />
              </div>

              <div className="space-y-2">
                <Label>Availability</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">From</span>
                    <Input
                      type="date"
                      value={availFrom}
                      min={TODAY}
                      onChange={(e) => {
                        const newFrom = e.target.value
                        setAvailFrom(newFrom)
                        if (availTo && newFrom > availTo) setAvailTo("")
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">To</span>
                    <Input
                      type="date"
                      value={availTo}
                      min={availFrom || TODAY}
                      onChange={(e) => setAvailTo(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Rating</Label>
                <Select value={minRating} onValueChange={setMinRating}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">All</SelectItem>
                    <SelectItem value="4">4+ stars</SelectItem>
                    <SelectItem value="3">3+ stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Engagement Type</Label>
                <MultiSelect
                  options={ENGAGEMENT_TYPE_OPTIONS}
                  selected={engagementTypes}
                  onChange={setEngagementTypes}
                  placeholder="Select options"
                />
              </div>
            </div>

            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </DrawerClose>
              <DrawerClose asChild>
                <Button onClick={applyFilters}>Apply Filters</Button>
              </DrawerClose>
            </DrawerFooter>
          </div>
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  )
}
