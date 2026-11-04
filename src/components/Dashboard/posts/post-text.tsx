import PostAiTags from "./post-ai-tags"
import PostFooter from "./post-footer"
import { CardContent } from "../../ui/card"
import { SelectPost } from "@/src/db/schema"
import { Badge } from "../../ui/badge"
import ExpandableText from "./ExpandableText"

type Props = {
  post: SelectPost
  spaceId?: string
}

const TextPost: React.FC<Props> = ({ post, spaceId }) => {
  const content = post.content ?? ""

  return (
    <>
      <CardContent className="p-0">
        {post.category && (
          <Badge variant="outline" className="mb-2">
            {post.category}
          </Badge>
        )}
        <ExpandableText content={content} lines={6} isHtml />

        <div className="mt-4 flex flex-wrap gap-2">
          <PostAiTags tags={post.ai_tags} />
          {post.hashtags &&
            post.hashtags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                #{tag.name}
              </Badge>
            ))}
        </div>
      </CardContent>
      <PostFooter post={post} spaceId={spaceId} />
    </>
  )
}

export default TextPost
