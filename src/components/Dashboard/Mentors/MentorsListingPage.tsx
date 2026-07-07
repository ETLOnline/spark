"use client"

import { useState, useMemo, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/src/components/ui/input"
import { Skeleton } from "@/src/components/ui/skeleton"
import MentorCard from "./MentorCard"
import MentorFilters from "./MentorFilters"
import { MentorData, MentorFiltersType, DEFAULT_FILTERS } from "./MentorTypes"
import type { MultiSelectOption } from "@/src/components/ui/multi-select"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetActiveMentorsAction } from "@/src/server-actions/Mentor/MentorActions"

export default function MentorsListingPage() {
  const [search, setSearch] = useState("")
  const [drawerFilters, setDrawerFilters] =
    useState<MentorFiltersType>(DEFAULT_FILTERS)

  const [mentors, setMentors] = useState<MentorData[]>([])
  const [loading, , , fetchMentors] = useServerAction(GetActiveMentorsAction)

  useEffect(() => {
    const load = async () => {
      try {
        const result = await fetchMentors({ isActive: true })
        if (!result?.success || !result.data) return
        setMentors(
          result.data.map((m) => ({
            id: m.unique_id,
            name: `${m.first_name} ${m.last_name}`.trim(),
            photo: m.profile_url ?? null,
            initials:
              `${m.first_name[0] ?? ""}${m.last_name[0] ?? ""}`.toUpperCase(),
            title: m.profile?.professional_title ?? null,
            company: m.profile?.company ?? null,
            bio: m.profile?.bio ?? null,
            tags: (m.userTags ?? [])
              .filter((ut) => ut.tag?.type === "skill" && !!ut.tag?.name)
              .map((ut) => ut.tag!.name!),
            interests: (m.userTags ?? [])
              .filter((ut) => ut.tag?.type === "interest" && !!ut.tag?.name)
              .map((ut) => ut.tag!.name!),
            rating: Number(m.profile?.total_average_rating) || 0,
            reviewCount: m.profile?.number_of_ratings ?? 0,
            completedSessions: m.profile?.total_completed_sessions ?? 0
          }))
        )
      } catch (error) {
        console.error("Failed to load mentors:", error)
      }
    }
    load()
  }, [])

  const skillOptions: MultiSelectOption[] = useMemo(() => {
    const unique = [...new Set(mentors.flatMap((m) => m.tags))].sort()
    return unique.map((t) => ({ label: t, value: t }))
  }, [mentors])

  const interestOptions: MultiSelectOption[] = useMemo(() => {
    const unique = [...new Set(mentors.flatMap((m) => m.interests))].sort()
    return unique.map((t) => ({ label: t, value: t }))
  }, [mentors])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return mentors.filter((m) => {
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        (m.title ?? "").toLowerCase().includes(q) ||
        (m.company ?? "").toLowerCase().includes(q) ||
        (m.bio ?? "").toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q))

      const matchesSkills =
        drawerFilters.skills.length === 0 ||
        drawerFilters.skills.some((s) => m.tags.includes(s))

      const matchesInterests =
        drawerFilters.interests.length === 0 ||
        drawerFilters.interests.some((i) => m.interests.includes(i))

      const matchesRating = m.rating >= drawerFilters.minRating

      return matchesSearch && matchesSkills && matchesInterests && matchesRating
    })
  }, [search, drawerFilters, mentors])

  return (
    <div className="bg-background overflow-x-hidden">
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
        <div className="flex items-center gap-2 w-full sm:w-1/2">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search mentors..."
              className="pl-10 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="shrink-0">
            <MentorFilters
              skillOptions={skillOptions}
              interestOptions={interestOptions}
              onApplyFilters={setDrawerFilters}
            />
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-muted-foreground">
            Showing
            <span className="font-medium text-foreground">
              {filtered.length}
            </span>
            {filtered.length === 1 ? "mentor" : "mentors"}
          </p>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12 text-sm">
            No mentors found.
          </p>
        )}

        {/* Mentor grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((mentor) => (
              <MentorCard key={mentor.id} mentor={mentor} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
