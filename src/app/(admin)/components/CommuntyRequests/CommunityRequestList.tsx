import Loader from "@/src/components/common/Loader/Loader"
import { SelectCommunityRequest } from "@/src/db/schema"
import { Gavel, ListCheck, MapPin, University, User } from "lucide-react"
import React, { useEffect, useState } from "react"
import CommunityRequestListItems from "./CommunityRequestListItems"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import CommunityRequestDetailModal from "./CommunityRequestDetailModal"
import CommunityRequestActionModal from "./CommunityRequestActionModal"
import { useServerAction } from "@/src/hooks/useServerAction"
import { getCommunityRequestsAction } from "@/src/server-actions/Community/CommunityRequests/CommunityRequests"
import { useRouter, useSearchParams } from "next/navigation"
import { PaginationType } from "@/src/components/common/types/pagination.type"
import PaginationComponent from "@/src/components/common/Pagination"

interface CommunityRequestListProps {
  status: string
}

function CommunityRequestList({ status }: CommunityRequestListProps) {
  const [selectedRequest, setSelectedRequest] =
    useState<SelectCommunityRequest | null>(null)
  const [openDetailModal, setOpenDetailModal] = useState(false)
  const [openActionModal, setOpenActionModal] = useState(false)
  const [isAcceptRequest, setIsAcceptRequest] = useState(false)
  const [isRejectRequest, setIsRejectRequest] = useState(false)
  const [communityRequests, setCommunityRequests] = useState<
    SelectCommunityRequest[]
  >([])
  const [pagination, setPagination] = useState<PaginationType>()

  const [getCommunityRequestsLoading, , , getCommunityRequests] =
    useServerAction(getCommunityRequestsAction)

  const searchParams = useSearchParams()
  const router = useRouter()
  const page = parseInt(searchParams.get("page") || "1", 10)

  const fetchData = async () => {
    const res = await getCommunityRequests({
      page: page,
      limit: 10,
      status: status
    })

    if (res?.success && res?.data) {
      setCommunityRequests(res.data.communityRequests)
      setPagination(res.data.pagination)
    }
  }

  useEffect(() => {
    fetchData()
  }, [searchParams.get("page"), status])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", "1")

    router.replace(`?${params.toString()}`, { scroll: false })
  }, [status])

  const hanldeClick = (request: SelectCommunityRequest) => {
    setSelectedRequest(request)
    setOpenDetailModal(true)
  }

  const handleAcceptRequest = (
    request: SelectCommunityRequest,
    isAccept: boolean
  ) => {
    setSelectedRequest(request)
    setIsAcceptRequest(isAccept)
    setOpenActionModal(true)
  }
  const handleRejectRequest = (
    request: SelectCommunityRequest,
    isReject: boolean
  ) => {
    setSelectedRequest(request)
    setIsRejectRequest(isReject)
    setOpenActionModal(true)
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="rounded-md border">
        <div className="grid grid-cols-12 gap-3 p-4 bg-muted/50 text-sm font-medium text-muted-foreground">
          <div className="col-span-3 flex items-center gap-2">
            <University className="w-4 h-4" />
            <span>University Name</span>
          </div>
          <div className="col-span-2 flex items-center justify-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>Country/City</span>
          </div>
          <div className="col-span-2 flex items-center justify-center gap-2">
            <User className="w-4 h-4" />
            <span>Contact Person</span>
          </div>
          <div className="col-span-2 text-center flex items-center justify-center gap-2">
            <ListCheck className="w-4 h-4 " />
            Status
          </div>
          <div className="col-span-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <Gavel className="w-4 h-4" />
              Action
            </div>
          </div>
        </div>

        {/* List */}
        {getCommunityRequestsLoading ? (
          <div className="flex justify-center h-full w-full my-4">
            <Loader size={LoaderSizes.lg} />
          </div>
        ) : communityRequests.length > 0 ? (
          <>
            {communityRequests.map((communityRequest) => (
              <CommunityRequestListItems
                key={communityRequest.id}
                communityRequest={communityRequest}
                hanldeClick={hanldeClick}
              />
            ))}

            {pagination && (
              <div className="flex justify-center my-4">
                <PaginationComponent pagination={pagination} />
              </div>
            )}
          </>
        ) : (
          <div className="flex justify-center h-full w-full my-4">
            <span className="text-muted-foreground">No requests found.</span>
          </div>
        )}

        <CommunityRequestDetailModal
          open={openDetailModal}
          onOpenChange={setOpenDetailModal}
          request={selectedRequest}
          handleAcceptRequest={handleAcceptRequest}
          handleRejectRequest={handleRejectRequest}
        />

        <CommunityRequestActionModal
          selectedRequest={selectedRequest}
          open={openActionModal}
          onOpenChange={setOpenActionModal}
          isAcceptRequest={isAcceptRequest}
          setIsAcceptRequest={setIsAcceptRequest}
          setIsRejectRequest={setIsRejectRequest}
          fetchRequests={fetchData}
          setIsDetailModalOpen={setOpenDetailModal}
        />
      </div>
    </div>
  )
}

export default CommunityRequestList
