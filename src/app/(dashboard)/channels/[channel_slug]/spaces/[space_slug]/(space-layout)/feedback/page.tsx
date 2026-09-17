import NotFound from "@/src/components/Dashboard/NotFound/NotFound"
import { GetSpaceBySlugAction } from "@/src/server-actions/Space/Space"
import FYPFeedback from "../components/feedback/FYPFeedback"

interface Props {
  params: Promise<{
    channel_slug: string
    space_slug: string
  }>
}

async function FeedbackPage({ params }: Props) {
  const { channel_slug, space_slug } = await params

  const decodedChannelSlug = decodeURIComponent(channel_slug)
  const decodedSpaceSlug = decodeURIComponent(space_slug)

  const currentSpace = await GetSpaceBySlugAction(
    decodedSpaceSlug,
    decodedChannelSlug
  )

  if (!currentSpace.success || !currentSpace.data) {
    return <NotFound />
  }

  return <FYPFeedback />
}

export default FeedbackPage
