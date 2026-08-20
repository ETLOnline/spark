import React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar"
import { VerifiedBadge } from "../../../ui/verified-badge"
import { SelectUser } from "@/src/db/schema"

interface Contributor {
  id: string
  name: string
  avatar: string
  role: string
}

interface Props {
  contributors: SelectUser[]
}

function Contributers({ contributors }: Props) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Contributors</h3>
      <div className="space-y-2">
        {contributors.map((contributor) => (
          <div
            key={contributor.unique_id}
            className="flex items-center space-x-2"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={contributor.profile_url ?? ""}
                alt={contributor.first_name}
              />
              <AvatarFallback>{contributor.first_name}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium flex items-center gap-1">
                {contributor.first_name} {contributor.last_name}
                {contributor.profile?.verified && <VerifiedBadge size={13} />}
              </p>
              {/* <p className="text-xs text-muted-foreground">
                {contributor.role}
              </p> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Contributers
