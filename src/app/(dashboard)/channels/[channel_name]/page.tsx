"use client"

import CreateSpace from "@/src/components/Dashboard/Spaces/CreateSpace/CreateSpace"
import { Card } from "@/src/components/ui/card"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetSpacesAction } from "@/src/server-actions/Spaces/space"
import { spaceStore } from "@/src/store/space/spaceStore"
import { useAtom } from "jotai"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

const ChannelSpacesPage = ({
  params
}: {
  params: { channel_name: string }
}) => {
  const searchParams = useSearchParams()

  const channelId = searchParams.get("channel_id")

  const [spaces, setSpaces] = useAtom(spaceStore.spaces)

  const [spacesLoading, spacesData, spacesError, getSpaces] =
    useServerAction(GetSpacesAction)

  useEffect(() => {
    ;(async () => {
      if (channelId) {
        const spacesData = await getSpaces(channelId)

        if (spacesData?.success) {
          setSpaces(spacesData.data)
        }
      }
    })()
  }, [])

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="w-full">
        <CreateSpace channelId={channelId as string} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {spaces.map((space) => (
          <Link
            key={space.id}
            href={`./${params.channel_name}/spaces?space_id=${space.id}`}
            className="block hover:opacity-90 transition-opacity"
          >
            <Card className="p-4 h-full">
              <h3 className="text-lg font-semibold mb-2">{space.space_name}</h3>
              <p className="text-sm text-gray-600">{space.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default ChannelSpacesPage
