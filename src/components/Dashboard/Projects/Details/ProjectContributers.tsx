import React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar"
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
              <p className="text-sm font-medium">
                {contributor.first_name} {contributor.last_name}
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
