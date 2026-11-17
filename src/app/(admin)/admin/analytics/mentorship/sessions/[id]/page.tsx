import SessionDetailView from "../../../../../components/analytics/mentorship/SessionDetailView"

interface Props {
  params: Promise<{ id: string }>
}

export default async function SessionDetailPage({ params }: Props) {
  const { id } = await params
  return <SessionDetailView sessionId={Number(id)} />
}
