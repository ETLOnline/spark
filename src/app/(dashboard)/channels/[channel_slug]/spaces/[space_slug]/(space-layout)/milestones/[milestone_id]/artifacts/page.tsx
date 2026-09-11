import MilestoneArtifactsView from "../../../components/MilestoneArtifactsView"

interface Props {
  params: Promise<{
    channel_slug: string
    space_slug: string
    milestone_id: string
  }>
}

export default async function MilestoneArtifactsPage({ params }: Props) {
  const { channel_slug, space_slug, milestone_id } = await params

  return (
    <MilestoneArtifactsView
      milestoneId={milestone_id}
      channelSlug={channel_slug}
      spaceSlug={space_slug}
    />
  )
}
