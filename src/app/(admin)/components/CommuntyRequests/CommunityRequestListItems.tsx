import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { SelectCommunityRequest } from "@/src/db/schema"
import { RequestStatus } from "@/src/types/CommunityCreationRequest/CommunityCreationRequest"
import { ArrowRight, CheckCircle2, Clock, XCircle } from "lucide-react"
import React from "react"

interface CommunityRequestListItemsProps {
  communityRequest: SelectCommunityRequest
  hanldeClick?: (request: SelectCommunityRequest) => void
}

function CommunityRequestListItems({
  communityRequest,
  hanldeClick
}: CommunityRequestListItemsProps) {
  return (
    <div
      key={communityRequest.id}
      className="grid grid-cols-12 gap-3 p-4 border-t items-center hover:bg-muted/50  transition delay-150 duration-300"
    >
      <div
        className={`col-span-3 cursor-pointer`}
        onClick={() => {
          hanldeClick?.(communityRequest)
        }}
      >
        {communityRequest.university_name}
      </div>

      <div className={"col-span-2 text-center"}>{communityRequest.city}</div>

      <div className="col-span-2 text-center">
        {communityRequest.contact_person_name}
      </div>

      <div className="col-span-2 text-center">
        <div className="flex items-center justify-center gap-2">
          {communityRequest.status === RequestStatus.ACCEPTED && (
            <>
              <Badge
                variant={"outline"}
                className="text-sm text-green-600 font-medium flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 " />
                Approved
              </Badge>
            </>
          )}
          {communityRequest.status === RequestStatus.REJECTED && (
            <>
              <Badge
                variant={"outline"}
                className="text-sm text-red-600 font-medium flex items-center justify-center gap-2"
              >
                <XCircle className="w-4 h-4 " />
                Rejected
              </Badge>
            </>
          )}
          {communityRequest.status === RequestStatus.PENDING && (
            <>
              <Badge
                variant={"outline"}
                className="text-sm text-amber-600 font-medium flex items-center justify-center gap-2 "
              >
                <Clock className="w-4 h-4" />
                Pending
              </Badge>
            </>
          )}
        </div>
      </div>

      <div className="col-span-3 text-center">
        <Button
          onClick={() => {
            hanldeClick?.(communityRequest)
          }}
        >
          View Details
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

export default CommunityRequestListItems
