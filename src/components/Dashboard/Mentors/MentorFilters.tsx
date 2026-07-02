"use client"

import { useState } from "react"
import { Filter } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Label } from "@/src/components/ui/label"
import { Switch } from "@/src/components/ui/switch"
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
  TierType,
  AvailabilityType,
  EngagementType,
  SessionFormat,
  MentorFiltersType,
  DEFAULT_FILTERS,
  SKILL_OPTIONS,
  AVAILABILITY_OPTIONS,
  TIER_OPTIONS,
  ENGAGEMENT_OPTIONS,
  FORMAT_OPTIONS
} from "./mentorsData"

export type { MentorFiltersType }

interface Props {
  onApplyFilters: (filters: MentorFiltersType) => void
}

export default function MentorFilters({ onApplyFilters }: Props) {
  const [skills, setSkills] = useState<MultiSelectOption[]>([])
  const [availability, setAvailability] = useState<MultiSelectOption[]>([])
  const [tiers, setTiers] = useState<MultiSelectOption[]>([])
  const [minRating, setMinRating] = useState("0")
  const [engagementTypes, setEngagementTypes] = useState<MultiSelectOption[]>(
    []
  )
  const [sessionFormats, setSessionFormats] = useState<MultiSelectOption[]>([])
  const [rpEligibleOnly, setRpEligibleOnly] = useState(false)

  function applyFilters() {
    onApplyFilters({
      skills: skills.map((s) => s.value),
      availability: availability.map((a) => a.value) as AvailabilityType[],
      tiers: tiers.map((t) => t.value) as TierType[],
      minRating: parseFloat(minRating),
      engagementTypes: engagementTypes.map((e) => e.value) as EngagementType[],
      sessionFormats: sessionFormats.map((f) => f.value) as SessionFormat[],
      rpEligibleOnly
    })
  }

  function clearFilters() {
    setSkills([])
    setAvailability([])
    setTiers([])
    setMinRating("0")
    setEngagementTypes([])
    setSessionFormats([])
    setRpEligibleOnly(false)
    onApplyFilters(DEFAULT_FILTERS)
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline" className=" w-full gap-2 ">
          <Filter className="h-4 w-4 " />
          Filters
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <ScrollArea className="max-h-[80dvh] overflow-y-auto">
          <div className="mx-auto w-full max-w-sm">
            <DrawerHeader>
              <DrawerTitle>Filter Mentors</DrawerTitle>
              <DrawerDescription>
                Filter by skills, availability, rating, tier, engagement type,
                and session format.
              </DrawerDescription>
            </DrawerHeader>

            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <Label>Skills</Label>
                <MultiSelect
                  options={SKILL_OPTIONS}
                  selected={skills}
                  onChange={setSkills}
                  placeholder="Select skills"
                />
              </div>

              <div className="space-y-2">
                <Label>Availability</Label>
                <MultiSelect
                  options={AVAILABILITY_OPTIONS}
                  selected={availability}
                  onChange={setAvailability}
                  placeholder="Select options"
                />
              </div>

              <div className="space-y-2">
                <Label>Tier</Label>
                <MultiSelect
                  options={TIER_OPTIONS}
                  selected={tiers}
                  onChange={setTiers}
                  placeholder="Select options"
                />
              </div>

              <div className="space-y-2">
                <Label>Minimum Rating</Label>
                <Select value={minRating} onValueChange={setMinRating}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Any rating</SelectItem>
                    <SelectItem value="3.5">3.5+</SelectItem>
                    <SelectItem value="4.0">4.0+</SelectItem>
                    <SelectItem value="4.5">4.5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Engagement Type</Label>
                <MultiSelect
                  options={ENGAGEMENT_OPTIONS}
                  selected={engagementTypes}
                  onChange={setEngagementTypes}
                  placeholder="Select options"
                />
              </div>

              <div className="space-y-2">
                <Label>Session Format</Label>
                <MultiSelect
                  options={FORMAT_OPTIONS}
                  selected={sessionFormats}
                  onChange={setSessionFormats}
                  placeholder="Select options"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                <div>
                  <p className="text-sm font-medium">RP Eligible Only</p>
                  <p className="text-xs text-muted-foreground">
                    Show only mentors who accept RP
                  </p>
                </div>
                <Switch
                  checked={rpEligibleOnly}
                  onCheckedChange={setRpEligibleOnly}
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
