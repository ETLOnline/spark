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
    <Link href={`./spaces/${space.space_slug}`} shallow={true}>
      <Card key={space.id}>
        <CardHeader className="pb-2">
          <div className="flex justify-between">
            <div className="relative h-12 w-12 overflow-hidden rounded-md">
              <Image
                src="/images/home/session-image2.jpg"
                alt={space.space_name}
                fill
                className="object-cover"
              />
            </div>
            {user && canUserIntract(user, space?.ownerId) ? (
              <div className="flex justify-end">
                <SpacesActionButtons space={space} />
              </div>
            ) : null}
          </div>
          <div>
            <CardTitle className="text-xl">{space.space_name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {0} members
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{space.description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}

export default SpacesCard
