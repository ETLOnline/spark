import Link from "next/link"
import { LayoutGrid } from "lucide-react"
import { Button } from "@/src/components/ui/button"

interface Props {
  spaceSlug?: string | null
}

export function ViewSpaceButton({ spaceSlug }: Props) {
  if (!spaceSlug) return null

  return (
    <Link href={`/mentorship/spaces/${spaceSlug}`} className="shrink-0">
      <Button variant="outline" size="sm">
        <LayoutGrid className="h-3.5 w-3.5 mr-1.5" />
        View Space
      </Button>
    </Link>
  )
}
