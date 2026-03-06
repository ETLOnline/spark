"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  DeleteCommunityAction,
  GetCommunitiesAction,
  GetCommunitiesActionResponse,
  GetCommunityCategoriesAction,
  GetJoinedCommunitiesAction
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
import pusherClient from "@/src/services/realtime/PusherClient"
import CommunityRequestBanner from "@/src/components/communities/CommunityRequestBanner"
import { userStore } from "@/src/store/user/userStore"

export default function CommunitiesPage() {
  const [communitiesList, setCommunitiesList] =
    useAtom<GetCommunitiesActionResponse | null>(communityStore.communities)

  const [communityFormModalVisibility, setCommunityFormModalVisibility] =
    useAtom(communityStore.communityFormModalVisibility)

  const setSelectedCommunity = useSetAtom(communityStore.selectedCommunity)

  const [refreshTrigger, setRefreshTrigger] = useAtom(
    communityStore.refreshCommunitiesTriggerAtom
  )

  const [searchTerm, setSearchTerm] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<SortByOptions>("newest")
  const [currentPageAll, setCurrentPageAll] = useState(1)
  const [currentPageJoined, setCurrentPageJoined] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(6)
  const [activeTab, setActiveTab] = useState<"all" | "joined">("all")
  const [isPaginating, setIsPaginating] = useState(false)

  const [loading, communitiesResult, error, fetchCommunities] =
    useServerAction(GetCommunitiesAction)

  const [
    loadingJoined,
    joinedCommunitiesResult,
    errorJoined,
    fetchJoinedCommunities
  ] = useServerAction(GetJoinedCommunitiesAction)

  const [deleteLoading, , deleteError, deleteCommunity] = useServerAction(
    DeleteCommunityAction
  )
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const previousFiltersRef = useRef<{
    filters: CommunityQueryFilters
    pageAll: number
    pageJoined: number
    limit: number
    refreshTriggerValue: boolean
  } | null>(null)

  const [communityCategories, setCommunityCategories] = useState<
    CommunityCategory[]
  >([])
  const initialLoadRef = useRef(true)
  const loadCommunities = useCallback(
    async (
      filters: CommunityQueryFilters,
      pageAll: number,
      pageJoined: number,
      limit: number
    ) => {
      const currentCombinedFilters = {
        filters,
        pageAll,
        pageJoined,
        limit,
        refreshTriggerValue: refreshTrigger
      }

      if (
        !initialLoadRef.current &&
        JSON.stringify(currentCombinedFilters) ===
          JSON.stringify(previousFiltersRef.current)
      ) {
        return
      }
      setIsPaginating(true)

      const [allRes, myRes] = await Promise.all([
        fetchCommunities({ ...filters, type: "all" }, pageAll, limit),
        fetchJoinedCommunities(
          { ...filters, type: "joined" },
          pageJoined,
          limit
        )
      ])
      if (allRes?.success && myRes?.success) {
        setCommunitiesList({
          communities: allRes.data.communities,
          allCommunitiesPagination: allRes.data.allCommunitiesPagination,
          joinedCommunities: myRes.data.joinedCommunities,
          joinedCommunitiesPagination: myRes.data.joinedCommunitiesPagination,
          joinedCount: myRes.data.joinedCount
        })
        previousFiltersRef.current = currentCombinedFilters
      }
      setIsPaginating(false)
    },
    [
      fetchCommunities,
      fetchJoinedCommunities,
      setCommunitiesList,
      refreshTrigger
    ]
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
      loadCommunities(
        currentFilters,
        currentPageAll,
        currentPageJoined,
        itemsPerPage
      )
      return
    }

    const currentRelevantPage =
      activeTab === "all" ? currentPageAll : currentPageJoined
    const previousRelevantPage =
      previousFiltersRef.current?.filters && activeTab === "all"
        ? previousFiltersRef.current.pageAll
        : previousFiltersRef.current?.pageJoined

    if (
      JSON.stringify(currentFilters) ===
        JSON.stringify(previousFiltersRef.current?.filters) &&
      refreshTrigger === previousFiltersRef.current?.refreshTriggerValue &&
      currentRelevantPage === previousRelevantPage
    ) {
      return
    }

    debounceTimeoutRef.current = setTimeout(() => {
      loadCommunities(
        currentFilters,
        currentPageAll,
        currentPageJoined,
        itemsPerPage
      )
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
    currentPageAll,
    currentPageJoined,
    itemsPerPage,
    loadCommunities,
    refreshTrigger,
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

  useEffect(() => {
    const pusherChannel = pusherClient.subscribe("broadcast-entity-update")

    const handleCommunityEdit = (updatedCommunity: SelectCommunity) => {
      setCommunitiesList((currentCommunities) => {
        if (!currentCommunities) return null
        return {
          ...currentCommunities,
          communities: currentCommunities.communities.map((community) =>
            community.id === updatedCommunity.id
              ? { ...community, ...updatedCommunity }
              : community
          ),
          joinedCommunities: currentCommunities.joinedCommunities.map(
            (community) =>
              community.id === updatedCommunity.id
                ? { ...community, ...updatedCommunity }
                : community
          )
        }
      })
    }

    pusherChannel.bind("community-edit", handleCommunityEdit)

    return () => {
      pusherChannel.unbind("community-edit", handleCommunityEdit)
      pusherClient.unsubscribe("broadcast-entity-update")
    }
  }, [setCommunitiesList])

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPageAll(1)
    setCurrentPageJoined(1)
  }
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    setCurrentPageAll(1)
    setCurrentPageJoined(1)
  }
  const handleSortByChange = (value: SortByOptions) => {
    setSortBy(value)
    setCurrentPageAll(1)
    setCurrentPageJoined(1)
  }

  const handleTabChange = (tabValue: string) => {
    if (tabValue === "all" || tabValue === "joined") {
      setActiveTab(tabValue)
    } else {
      console.warn("Unexpected tab value received:", tabValue)
    }
  }

  const handleCreateCommunityClick = () => {
    setSelectedCommunity(null)
    setCommunityFormModalVisibility(true)
  }

  const handleEditCommunity = (communityToEdit: SelectCommunity) => {
    setSelectedCommunity(communityToEdit)
    setCommunityFormModalVisibility(true)
  }

  const handleJoinCommunity = () => {
    setRefreshTrigger((prev) => !prev)
    setCurrentPageAll(1)
    setCurrentPageJoined(1)
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
        setCurrentPageAll(1)
        setCurrentPageJoined(1)
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
    if (activeTab === "all") {
      setCurrentPageAll(page)
    } else {
      setCurrentPageJoined(page)
    }
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

  const isSuperAdmin = Boolean(useAtomValue(userStore.SuperAdmin))
  const isUserLoading = Boolean(useAtomValue(userStore.LoadingUser))

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

      {/* Community Request Banner */}
      {!isUserLoading && isSuperAdmin === false ? (
        <CommunityRequestBanner />
      ) : null}

      {/* Community List Tabs: ALWAYS RENDER THIS COMPONENT */}
      <CommunityListTabs
        loading={isPaginating || loading}
        error={error}
        communitiesList={communitiesList}
        onEditCommunity={handleEditCommunity}
        onDeleteCommunity={handleDeleteCommunity}
        onJoinCommunity={handleJoinCommunity}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Pagination UI - Only show if not loading, no error, and there's more than one page */}
      {!loading &&
        !error &&
        paginationData &&
        paginationData.total > 0 && // Check total communities for pagination visibility
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
