import EventsDetailsClient from "@/src/components/Dashboard/Event/EventDetails"

interface EventDetailPageProps {
  params: Promise<{
    event_id: string
  }>
}

export default async function EventDetailPage({
  params
}: EventDetailPageProps) {
  const { event_id } = await params

  return <EventsDetailsClient event_id={event_id} />
}
