import FypDetailView from "../../../../../components/analytics/fyp/FypDetailView"

interface Props {
  params: Promise<{ id: string }>
}

export default async function FypDetailPage({ params }: Props) {
  const { id } = await params
  return <FypDetailView spaceId={id} />
}
