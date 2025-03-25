import React from "react"
import Link from "next/link"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { SelectSpace } from "@/src/db/schema"
import SpacesActionButtons from "./SpaceActionButtons"
import { userStore } from "@/src/store/user/userStore"
import { useAtomValue } from "jotai"
import { canUserIntract } from "@/src/utils/helpers"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"

interface Props {
  space: SelectSpace
}

function SpacesCard({ space }: Props) {
  const user = useAtomValue(userStore.AuthUser)
  return (
    <Card key={space.id} className="overflow-hidden">
      <div className="aspect-video w-full overflow-hidden">
        <img
          src={"/images/home/session-image2.jpg"}
          alt={space.space_name}
          className="w-full h-full object-cover transition-transform hover:scale-105"
        />
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{space.space_name}</CardTitle>
          {user && canUserIntract(user, space.ownerId) ? (
            <SpacesActionButtons space={space} />
          ) : null}
        </div>
        <CardDescription>{space.description}</CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between">
        <Badge variant="secondary">
          {/* {space.membersCount} {space.membersCount === 1 ? 'Member' : 'Members'} */}
          0 Members
        </Badge>
        <Link href={`./spaces/${space.space_slug}`}>
          <Button>
            Open Space
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}

export default SpacesCard
