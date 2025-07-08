"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useAtom } from "jotai"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  DeleteCommunityAction,
  GetCommunitiesAction,
  GetCommunitiesActionResponse,
  GetCommunityCategoriesAction
} from "@/src/server-actions/Community/Community"
import {
  CommunityCategory,
  CommunityQueryFilters,
  CommunityType,
  SortByOptions
} from "@/src/db/data-access/communities/query"
import CommunitiesHeader from "@/src/components/communities/CommunitiesHeader"
import CommunitiesFilterBar from "@/src/components/communities/CommunitiesFilterSection"
import CommunityListTabs from "@/src/components/communities/CommunityListTab"
import { communityStore } from "@/src/store/community/communityStore"
import CreateCommunityModal from "@/src/components/communities/CreateCommunityModal"
import { SelectCommunity } from "@/src/db/schema"
import { toast } from "@/src/hooks/use-toast"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/src/components/ui/pagination"
import NoDataCard from "@/src/components/Dashboard/Channels/ChannelDetails/NoDataCard"
import { Group } from "lucide-react"

interface EnhancedCommunityQueryFilters extends CommunityQueryFilters {
  refreshTriggerValue?: boolean
  page?: number
  limit?: number
  activeTab?: "all" | "my"
}

export default function CommunitiesPage() {
  const [communitiesList, setCommunitiesList] =
    useAtom<GetCommunitiesActionResponse | null>(communityStore.communities)

  const [communityFormModalVisibility, setCommunityFormModalVisibility] =
    useAtom(communityStore.communityFormModalVisibility)

  const [, setSelectedCommunity] = useAtom(communityStore.selectedCommunity)

  const [refreshTrigger, setRefreshTrigger] = useAtom(
    communityStore.refreshCommunitiesTriggerAtom
  )

  const [searchTerm, setSearchTerm] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<SortByOptions>("newest")

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(6)
  const [activeTab, setActiveTab] = useState<"all" | "my">("all")
  const [loading, communitiesResult, error, fetchCommunities] =
    useServerAction(GetCommunitiesAction)
  const [deleteLoading, , deleteError, deleteCommunity] = useServerAction(
    DeleteCommunityAction
  )
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const previousFiltersRef = useRef<EnhancedCommunityQueryFilters | null>(null)
  const [communityCategories, setCommunityCategories] = useState<
    CommunityCategory[]
  >([])
  const initialLoadRef = useRef(true)
  const loadCommunities = useCallback(
    async (
      filters: CommunityQueryFilters,
      page: number,
      limit: number,
      currentActiveTab: "all" | "my"
    ) => {
      const currentEnhancedFilters: EnhancedCommunityQueryFilters = {
        ...filters,
        refreshTriggerValue: refreshTrigger,
        page,
        limit,
        activeTab: currentActiveTab
      }
      if (
        !initialLoadRef.current &&
        JSON.stringify(currentEnhancedFilters) ===
          JSON.stringify(previousFiltersRef.current)
      ) {
        return
      }
      // NEW: Pass activeTab to fetchCommunities server action
      const res = await fetchCommunities(filters, page, limit, currentActiveTab)

      if (res?.success && res.data) {
        setCommunitiesList(res.data)
        previousFiltersRef.current = currentEnhancedFilters
      }
    },
    [fetchCommunities, setCommunitiesList, refreshTrigger]
  )

  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current)
    }

    const currentFilters: CommunityQueryFilters = {
      searchTerm: searchTerm === "" ? undefined : searchTerm,
      communityCategory:
        selectedCategory === "all"
          ? undefined
          : (selectedCategory as CommunityType),
      sortBy: sortBy
    }

    if (initialLoadRef.current) {
      initialLoadRef.current = false
      loadCommunities(currentFilters, currentPage, itemsPerPage, activeTab)
      return
    }

    debounceTimeoutRef.current = setTimeout(() => {
      loadCommunities(currentFilters, currentPage, itemsPerPage, activeTab)
    }, 300)

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [
    searchTerm,
    selectedCategory,
    sortBy,
    currentPage,
    itemsPerPage,
    loadCommunities,
    activeTab
  ])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await GetCommunityCategoriesAction()
        setCommunityCategories(categories)
      } catch (err) {
        console.error("Error fetching categories:", err)
      }
    }

    fetchCategories()
  }, [])

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    setCurrentPage(1)
  }
  const handleSortByChange = (value: SortByOptions) => {
    setSortBy(value)
    setCurrentPage(1)
  }

  const handleTabChange = (tabValue: string) => {
    if (tabValue === "all" || tabValue === "my") {
      setActiveTab(tabValue)
    } else {
      console.warn("Unexpected tab value received:", tabValue)
    }
    setCurrentPage(1)
  }

  const handleCreateCommunityClick = () => {
    setSelectedCommunity(null)
    setCommunityFormModalVisibility(true)
  }

  const handleEditCommunity = (communityToEdit: SelectCommunity) => {
    setSelectedCommunity(communityToEdit)
    setCommunityFormModalVisibility(true)
  }

  const handleDeleteCommunity = async (communityToDelete: SelectCommunity) => {
    try {
      const res = await deleteCommunity(communityToDelete)
      if (res?.success) {
        toast({
          title: "Community Deleted",
          description:
            res.message || "The community has been successfully deleted.",
          duration: 3000
        })
        setRefreshTrigger((prev) => !prev)
        setCurrentPage(1)
      } else {
        toast({
          title: "Deletion Failed",
          description: "Could not delete the community.",
          variant: "destructive",
          duration: 3000
        })
      }
    } catch (err) {
      console.error("Error during community deletion:", err)
      toast({
        title: "Deletion Error",
        description: "An unexpected error occurred during deletion.",
        variant: "destructive",
        duration: 3000
      })
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const paginationData =
    activeTab === "all"
      ? communitiesList?.allCommunitiesPagination
      : communitiesList?.joinedCommunitiesPagination
  const totalPages = paginationData?.totalPages || 1
  const currentPageFromData = paginationData?.page || 1

  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5
    let startPage = Math.max(
      1,
      currentPageFromData - Math.floor(maxPagesToShow / 2)
    )
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, totalPages - maxPagesToShow + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    return pages
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Communities Header: Includes the "Create Community" button */}
      <CommunitiesHeader onCreateCommunityClick={handleCreateCommunityClick} />

      {/* Communities Filter Bar: Handles search, category, and sort */}
      <CommunitiesFilterBar
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        sortBy={sortBy}
        onSearchChange={handleSearchChange}
        onCategoryChange={handleCategoryChange}
        onSortByChange={handleSortByChange}
        availableCategories={communityCategories}
      />

      {/* Community List Tabs: Displays communities based on fetched data */}
      {!loading &&
      !error &&
      communitiesList &&
      communitiesList.communities.length > 0 ? (
        <CommunityListTabs
          loading={loading}
          error={error}
          communitiesList={communitiesList}
          onEditCommunity={handleEditCommunity}
          onDeleteCommunity={handleDeleteCommunity}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      ) : (
        <NoDataCard
          icon={<Group className="h-16 w-16 text-muted-foreground mb-4" />}
          title="No communities found"
          description="Adjust your filters or try a different search term."
        />
      )}

      {/* Pagination UI */}
      {!loading &&
        !error &&
        communitiesList &&
        communitiesList.communities.length > 0 &&
        totalPages > 1 && (
          <Pagination className="mt-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={() => handlePageChange(currentPageFromData - 1)}
                  className={
                    currentPageFromData === 1
                      ? "pointer-events-none opacity-50"
                      : undefined
                  }
                />
              </PaginationItem>
              {getPageNumbers().map((pageNumber) => (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href="#"
                    isActive={pageNumber === currentPageFromData}
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={() => handlePageChange(currentPageFromData + 1)}
                  className={
                    currentPageFromData === totalPages
                      ? "pointer-events-none opacity-50"
                      : undefined
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}

      {/* Create/Edit Community Modal: Hidden by default, shown when triggered */}
      <CreateCommunityModal availableCategories={communityCategories} />
    </div>
  )
}
