"use client"

import React, { useState } from "react"
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
  RATING_OPTIONS,
  ENGAGEMENT_TYPE_OPTIONS
} from "./MentorTypes"

export type { MentorFiltersType }

interface Props {
  skillOptions: MultiSelectOption[]
  interestOptions: MultiSelectOption[]
  onApplyFilters: (filters: MentorFiltersType) => void
}

const TODAY = moment().format("YYYY-MM-DDTHH:mm")

const preventDrawerDrag = (e: React.PointerEvent) => e.stopPropagation()

export default function MentorFilters({
  skillOptions,
  interestOptions,
  onApplyFilters
}: Props) {
  const [skills, setSkills] = useState<MultiSelectOption[]>([])
  const [interests, setInterests] = useState<MultiSelectOption[]>([])
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
      interests: interests.map((i) => i.value),
      availability,
      minRating: Number(minRating),
      engagementTypes: engagementTypes.map((e) => e.value) as EngagementType[]
    })
  }

  function clearFilters() {
    setSkills([])
    setInterests([])
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

            <div className="px-4 space-y-4">
              {/* Availability */}
              <div className="space-y-2">
                <Label>Availability</Label>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">From</span>
                    <Input
                      type="datetime-local"
                      value={availFrom}
                      min={TODAY}
                      className="w-full"
                      onPointerDownCapture={preventDrawerDrag}
                      onChange={(e) => {
                        const val = e.target.value
                        setAvailFrom(val)
                        if (availTo && val > availTo) setAvailTo("")
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">To</span>
                    <Input
                      type="datetime-local"
                      value={availTo}
                      min={availFrom || TODAY}
                      className="w-full"
                      onPointerDownCapture={preventDrawerDrag}
                      onChange={(e) => setAvailTo(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label>Skills / Expertise</Label>
                <MultiSelect
                  options={skillOptions}
                  selected={skills}
                  onChange={setSkills}
                  placeholder="Select skills"
                />
              </div>

              {/* Interests */}
              <div className="space-y-2">
                <Label>Interests</Label>
                <MultiSelect
                  options={interestOptions}
                  selected={interests}
                  onChange={setInterests}
                  placeholder="Select interests"
                />
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <Label>Rating</Label>
                <Select value={minRating} onValueChange={setMinRating}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    {RATING_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Engagement Type */}
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
