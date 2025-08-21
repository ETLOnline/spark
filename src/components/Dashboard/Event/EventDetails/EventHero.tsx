import { Badge } from "@/src/components/ui/badge"
import { Label } from "@/src/components/ui/label"
import { tagsRelations } from "@/src/db/schema"

export function EventHero({ title, tags }: { title: string; tags: string[] }) {
  return (
    <div className="mb-6">
      <Label className="text-2xl font-bold mb-3">{title}</Label>
      <div className="flex gap-2 flex-wrap">
        {tags.map((tag, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="text-xs px-2 py-0.5"
          >
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  )
}
