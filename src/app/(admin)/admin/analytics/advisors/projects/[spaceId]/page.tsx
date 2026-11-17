import ProjectDetailsView from "../../../../../components/analytics/advisors/ProjectDetailsView"

export default async function ProjectDetailsPage({
  params
}: {
  params: Promise<{ spaceId: string }>
}) {
  const { spaceId } = await params
  return <ProjectDetailsView spaceId={spaceId} />
}
