"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAtomValue } from "jotai"
import { spaceStore } from "@/src/store/space/spaceStore"

const SpacesPage: React.FC = () => {
  const searchParams = useSearchParams()

  const spaceId = searchParams.get("space_id")

  const activeCategory = useAtomValue(spaceStore.activeCategory)

  return (
    <div className="container mx-auto space-y-8">
      {/* Display the extracted spaceId */}
      {spaceId && <div className="text-lg font-bold">Space ID: {spaceId}</div>}
      {/* Widgets for Discussion and Work */}
      <div className="flex flex-col md:flex-row gap-4">
        <Link
          href={`./spaces/posts?space_id=${spaceId}&active_category=${activeCategory}`}
        >
          <div className="flex-1 p-6 bg-background border border-gray-200 rounded-md shadow hover:shadow-md transition ">
            <h2 className="text-xl font-semibold mb-2">Discussion</h2>
          </div>
        </Link>
        <Link href={`./spaces/work?space_id=${spaceId}`}>
          <div className="flex-1 p-6 bg-background border border-gray-200 rounded-md shadow hover:shadow-md transition">
            <h2 className="text-xl font-semibold mb-2">Work</h2>
          </div>
        </Link>
      </div>
    </div>
  )
}

export default SpacesPage
