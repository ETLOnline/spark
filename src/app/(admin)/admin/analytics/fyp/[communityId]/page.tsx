import FypCommunityDirectoryView from "../../../../components/analytics/fyp/FypCommunityDirectoryView"

interface Props {
  params: Promise<{ communityId: string }>
}

export default async function FypCommunityDirectoryPage({ params }: Props) {
  const { communityId } = await params
  return <FypCommunityDirectoryView communityId={communityId} />
}
