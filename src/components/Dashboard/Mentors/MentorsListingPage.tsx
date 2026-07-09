"use client"

import { useState, useMemo, useEffect } from "react"
import { useDebouncedCallback } from "use-debounce"
import { Search } from "lucide-react"
import { Input } from "@/src/components/ui/input"
import { Skeleton } from "@/src/components/ui/skeleton"
import MentorCard from "./MentorCard"
import MentorFilters from "./MentorFilters"
import { MentorFiltersType, DEFAULT_FILTERS } from "./MentorTypes"
import type { MultiSelectOption } from "@/src/components/ui/multi-select"
import PaginationComponent from "@/src/components/common/Pagination"
import type { PaginationType } from "@/src/components/common/types/pagination.type"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetActiveMentorsAction } from "@/src/server-actions/Mentor/MentorActions"
import type { SelectUser } from "@/src/db/schema"
import type { GetMentorFilters } from "@/src/db/data-access/mentor/query"

export default function MentorsListingPage() {
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const updateDebouncedSearch = useDebouncedCallback((value: string) => {
    setDebouncedSearch(value)
    setCurrentPage(1)
  }, 800)
  const [drawerFilters, setDrawerFilters] =
    useState<MentorFiltersType>(DEFAULT_FILTERS)
  const [mentorData, setMentorData] = useState<{
    mentors: SelectUser[]
    pagination: PaginationType
  }>({
    mentors: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 12,
      totalPages: 0
    }
  })
  const [loading, , , fetchMentors] = useServerAction(GetActiveMentorsAction)

  // Fetch mentors with all filters and pagination
  useEffect(() => {
    const load = async () => {
      try {
        const filters: GetMentorFilters = {
          availabilityFrom: drawerFilters.availability?.from,
          availabilityTo: drawerFilters.availability?.to,
          searchedItem: debouncedSearch || undefined,
          skills:
            drawerFilters.skills.length > 0 ? drawerFilters.skills : undefined,
          interests:
            drawerFilters.interests.length > 0
              ? drawerFilters.interests
              : undefined,
          minRating:
            drawerFilters.minRating > 0 ? drawerFilters.minRating : undefined,
          engagementTypes:
            drawerFilters.engagementTypes.length > 0
              ? drawerFilters.engagementTypes
              : undefined,
          page: currentPage,
          limit: 12,
          isActive: true
        }

        const result = await fetchMentors(filters)
        if (!result?.success || !result.data) return
        setMentorData((prev) => ({
          mentors: result.data,
          pagination: result.pagination ?? prev.pagination
        }))
      } catch (error) {
        console.error("Failed to load mentors:", error)
      }
    }
    load()
  }, [drawerFilters, debouncedSearch, currentPage])

  const mentors = mentorData.mentors
  const pagination = mentorData.pagination

  const skillOptions: MultiSelectOption[] = useMemo(() => {
    const unique = [
      ...new Set(
        mentors.flatMap((m) =>
          (m.userTags ?? [])
            .filter((ut) => ut.tag?.type === "skill" && !!ut.tag?.name)
            .map((ut) => ut.tag!.name!)
        )
      )
    ].sort()
    return unique.map((t) => ({ label: t, value: t }))
  }, [mentors])

  const interestOptions: MultiSelectOption[] = useMemo(() => {
    const unique = [
      ...new Set(
        mentors.flatMap((m) =>
          (m.userTags ?? [])
            .filter((ut) => ut.tag?.type === "interest" && !!ut.tag?.name)
            .map((ut) => ut.tag!.name!)
        )
      )
    ].sort()
    return unique.map((t) => ({ label: t, value: t }))
  }, [mentors])

  const handleApplyFilters = (filters: MentorFiltersType) => {
    setDrawerFilters(filters)
    setCurrentPage(1) // Reset to first page when filters change
  }

  return (
    <div className="bg-background overflow-x-hidden">
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
              onChange={(e) => {
                setSearch(e.target.value)
                updateDebouncedSearch(e.target.value)
              }}
            />
          </div>
          <div className="shrink-0">
            <MentorFilters
              skillOptions={skillOptions}
              interestOptions={interestOptions}
              onApplyFilters={handleApplyFilters}
            />
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-muted-foreground ">
            Showing
            <span className="font-medium text-foreground mx-1">
              {mentors.length}
            </span>
            {pagination.total === 1 ? "mentor" : "mentors"}
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
        {!loading && mentors.length === 0 && (
          <p className="text-center text-muted-foreground py-12 text-sm">
            No mentors found.
          </p>
        )}

        {/* Mentor grid */}
        {!loading && mentors.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {mentors.map((mentor) => (
              <MentorCard key={mentor.unique_id} mentor={mentor} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <PaginationComponent
            pagination={pagination}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </div>
  )
}
