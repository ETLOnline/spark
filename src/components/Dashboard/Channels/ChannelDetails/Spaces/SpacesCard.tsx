import React from "react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import Image from "next/image"
import { SelectSpace } from "@/src/db/schema"
import SpacesActionButtons from "./SpaceActionButtons"
import { userStore } from "@/src/store/user/userStore"
import { useAtomValue } from "jotai"
import { canUserIntract } from "@/src/utils/helpers"

interface Props {
  space: SelectSpace
}

function SpacesCard({ space }: Props) {
  const user = useAtomValue(userStore.AuthUser)
  return (
    <Link href={`./spaces/${space.space_slug}`} shallow={true} >
      <Card key={space.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start gap-3">
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
              <Image
                src="/images/home/session-image2.jpg"
                alt={space.space_name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl truncate">
                {space.space_name}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground truncate">
                {0} members
              </CardDescription>
            </div>
            {user && canUserIntract(user, space?.ownerId) ? (
              <div className="flex-shrink-0">
                <SpacesActionButtons space={space} />
              </div>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {space.description}
          </p>
        </CardContent>
      </Card>
    </Link>
  )
}

export default SpacesCard
