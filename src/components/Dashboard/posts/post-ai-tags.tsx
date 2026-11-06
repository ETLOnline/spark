import { Sparkles } from "lucide-react"
import { Badge } from "../../ui/badge"
import {
  isPostAiTag,
  POST_AI_TAG_LABELS
} from "@/src/services/ai/schemas/postCheck.schema"

type Props = {
  tags?: string[] | null
}

// Tags added by AI (helpful, impressive, ...), shown next to the post's hashtags
const PostAiTags: React.FC<Props> = ({ tags }) => {
  const knownTags = (tags ?? []).filter(isPostAiTag)
  if (!knownTags.length) return null

  return (
    <>
      {knownTags.map((tag) => (
        <Badge key={tag} variant="outline" className="gap-1">
          <Sparkles className="h-3 w-3" />
          {POST_AI_TAG_LABELS[tag]}
        </Badge>
      ))}
    </>
  )
}

export default PostAiTags
