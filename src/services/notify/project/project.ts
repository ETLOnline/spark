import { GetProjectByIdAction } from "@/src/server-actions/ProjectManagement/projectManagement"
import { AddToQueue } from "../../queue/addToQueue"
import { getBulkUsers } from "@/src/db/data-access/user/query"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { createAbsoluteUrl, getSiteLogoUrl } from "@/src/utils/clientHelper"

export async function createProjectInviteNotification(
  event: string,
  users_ids: string[],
  projectId: string
) {
  const authUser = await AuthUserAction()
  if (!authUser) throw new Error("Unauthorized")
  const project = await GetProjectByIdAction(projectId)
  if (!project) throw new Error("Project not found")
  const BulkUsers = await getBulkUsers(users_ids)
  const sendingTo = [...new Set(BulkUsers.map((user) => user.email))]
  const logoUrl = getSiteLogoUrl()
  const linkUrl = createAbsoluteUrl(`/project/${project?.data?.id}/board`)
  const payload = {
    logoUrl: logoUrl,
    subject: "You've Been Added to a Project!",
    projectName: project?.data?.project_name,
    inviterName: `${authUser.first_name} ${authUser.last_name}`,
    ctaLink: linkUrl
  }

  await AddToQueue({
    sendingTo,
    event,
    payload,
    withData: true
  })
}
