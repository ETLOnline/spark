"use client"

import { useState } from "react"
import { Filter } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Label } from "@/src/components/ui/label"
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
import { Switch } from "@/src/components/ui/switch"
import MultiSelect, {
  MultiSelectOption
} from "@/src/components/ui/multi-select"
import {
  TierType,
  SessionFormat,
  EngagementType,
  MentorFiltersType,
  DEFAULT_FILTERS,
  SKILL_OPTIONS,
  TIER_OPTIONS,
  SESSION_FORMAT_OPTIONS,
  ENGAGEMENT_TYPE_OPTIONS
} from "./mentorsData"

export type { MentorFiltersType }

interface Props {
  onApplyFilters: (filters: MentorFiltersType) => void
}

export default function MentorFilters({ onApplyFilters }: Props) {
  const [skills, setSkills] = useState<MultiSelectOption[]>([])
  const [availability, setAvailability] = useState("all")
  const [tiers, setTiers] = useState<MultiSelectOption[]>([])
  const [minRating, setMinRating] = useState("0")
  const [sessionFormats, setSessionFormats] = useState<MultiSelectOption[]>([])
  const [engagementTypes, setEngagementTypes] = useState<MultiSelectOption[]>(
    []
  )
  const [rpEligibleOnly, setRpEligibleOnly] = useState(false)

  function applyFilters() {
    onApplyFilters({
      skills: skills.map((s) => s.value),
      availability,
      tiers: tiers.map((t) => t.value) as TierType[],
      minRating: parseFloat(minRating),
      sessionFormats: sessionFormats.map((s) => s.value) as SessionFormat[],
      engagementTypes: engagementTypes.map((e) => e.value) as EngagementType[],
      rpEligibleOnly
    })
  }

  function clearFilters() {
    setSkills([])
    setAvailability("all")
    setTiers([])
    setMinRating("0")
    setSessionFormats([])
    setEngagementTypes([])
    setRpEligibleOnly(false)
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
                Filter by skills, availability, rating, tier, session format,
                and engagement type.
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
                <Select value={availability} onValueChange={setAvailability}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="available-now">Available now</SelectItem>
                    <SelectItem value="available-this-week">
                      Available this week
                    </SelectItem>
                  </SelectContent>
                </Select>
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
                <Label>Tier</Label>
                <MultiSelect
                  options={TIER_OPTIONS}
                  selected={tiers}
                  onChange={setTiers}
                  placeholder="Select tiers"
                />
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

              <div className="space-y-2">
                <Label>Session Format</Label>
                <MultiSelect
                  options={SESSION_FORMAT_OPTIONS}
                  selected={sessionFormats}
                  onChange={setSessionFormats}
                  placeholder="Select options"
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium">My RP eligible only</p>
                  <p className="text-xs text-muted-foreground">
                    Show only mentors you have enough RPs to request
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
