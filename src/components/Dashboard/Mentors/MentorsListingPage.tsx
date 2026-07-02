"use client"

import { useState, useMemo } from "react"
import { Search } from "lucide-react"
import { Input } from "@/src/components/ui/input"
import MentorCard from "./MentorCard"
import MentorFilters from "./MentorFilters"
import {
  MENTORS_DATA,
  MentorFiltersType,
  DEFAULT_FILTERS,
  USER_RP_BALANCE
} from "./mentorsData"

export default function MentorsListingPage() {
  const [search, setSearch] = useState("")
  const [drawerFilters, setDrawerFilters] =
    useState<MentorFiltersType>(DEFAULT_FILTERS)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return MENTORS_DATA.filter((m) => {
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.title.toLowerCase().includes(q) ||
        m.company.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q))

      const matchesSkills =
        drawerFilters.skills.length === 0 ||
        drawerFilters.skills.some((s) => m.tags.includes(s))

      const matchesAvailability =
        drawerFilters.availability === "all" ||
        (drawerFilters.availability === "available-now" &&
          m.availability === "Available") ||
        (drawerFilters.availability === "available-this-week" &&
          m.availability === "Available")

      const matchesTier =
        drawerFilters.tiers.length === 0 || drawerFilters.tiers.includes(m.tier)

      const matchesRating = m.rating >= drawerFilters.minRating

      const matchesSessionFormat =
        drawerFilters.sessionFormats.length === 0 ||
        drawerFilters.sessionFormats.includes(m.sessionFormat)

      const matchesEngagementType =
        drawerFilters.engagementTypes.length === 0 ||
        drawerFilters.engagementTypes.includes(m.engagementType)

      const matchesRpEligible =
        !drawerFilters.rpEligibleOnly || m.rpRequired <= USER_RP_BALANCE

      return (
        matchesSearch &&
        matchesSkills &&
        matchesAvailability &&
        matchesTier &&
        matchesRating &&
        matchesSessionFormat &&
        matchesEngagementType &&
        matchesRpEligible
      )
    })
  }, [search, drawerFilters])

  return (
    <div className="bg-background">
      {/* Page header */}
      <div className="px-3 py-3">
        <h1 className="text-xl font-bold tracking-tight">Mentors</h1>
        <p className="text-muted-foreground text-xs">
          Connect with experienced mentors who can help you learn, grow, and
          achieve your goals.
        </p>
      </div>

      <div className="w-full px-3 pb-4 space-y-4">
        {/* Filter bar */}
        <div className="flex items-center gap-2">
          <div className="relative w-96 shrink-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search mentors..."
              className="pl-10 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-28 shrink-0">
            <MentorFilters onApplyFilters={setDrawerFilters} />
          </div>
        </div>

        {/* Results */}
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Showing{" "}
            <span className="font-medium text-foreground">
              {filtered.length}
            </span>{" "}
            {filtered.length === 1 ? "mentor" : "mentors"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
