import { Sparkles } from "lucide-react"
import { Badge } from "../../ui/badge"
import {
  isPostAiTag,
  POST_AI_TAG_LABELS
} from "@/src/services/ai/schemas/postCheck.schema"

type Props = {
  tags?: string[] | null
}

// Tags added by AI (helpful, impressive, ...), shown in their own section below the post's hashtags
const PostAiTags: React.FC<Props> = ({ tags }) => {
  const knownTags = (tags ?? []).filter(isPostAiTag)
  if (!knownTags.length) return null

  return (
    <section className="mt-4 mb-2">
      <h4 className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Sparkles className="h-3 w-3" />
        Tags applied by AI
      </h4>
      <div className="flex flex-wrap gap-2">
        {knownTags.map((tag) => (
          <Badge key={tag} variant="outline">
            {POST_AI_TAG_LABELS[tag]}
          </Badge>
        ))}
      </div>
    </section>
  )
}

export default PostAiTags
