import { GetCommunityDetailsAction } from "@/src/server-actions/Community/Community"
import { GetChannelBySlugAction } from "@/src/server-actions/Channel/Channel"
import { GetSpaceBySlugAction } from "@/src/server-actions/Space/Space"
import { GetProjectByIdAction } from "@/src/server-actions/ProjectManagement/projectManagement"
import { GetRoleWithPermissionsAction } from "@/src/server-actions/UserRoles/UserRole"

/**
 * Defines the structure for a single breadcrumb configuration item.
 * - `path`: The segment of the URL (e.g., "/communities", "/[community-slug]").
 * - `label`: The static text to display for the breadcrumb (optional, if dynamic).
 * - `dynamicLabelFetcher`: An optional asynchronous function that fetches the actual
 * display name for dynamic segments (like slugs or IDs). It takes the slug/ID as input.
 * - `children`: Allows defining nested routes to build the full path hierarchy.
 */
export interface BreadcrumbConfigItem {
  path: string
  label?: string
  dynamicLabelFetcher?: (
    slugOrId: string,
    allParams?: Record<string, string | string[]>,
    resolvedData?: any
  ) => Promise<string | null | { label: string; path?: string; data?: any }[]>
  children?: BreadcrumbConfigItem[]
}

/**
 * The main breadcrumb configuration array.
 * This array defines the expected URL paths and how to display their breadcrumbs.
 * Order generally matters for matching, from broader to more specific.
 */
export const breadcrumbConfig: BreadcrumbConfigItem[] = [
  { path: "/dashboard", label: "Dashboard" },

  { path: "/analytics-dashboard", label: "Analytics Dashboard" },
  { path: "/profile", label: "Profile" },
  { path: "/connections", label: "Connections" },
  { path: "/posts", label: "Posts" },
  { path: "/chat", label: "Chat" },
  { path: "/events", label: "Events" },

  {
    path: "/communities",
    label: "Communities",
    children: [
      {
        path: "/[community-slug]",
        dynamicLabelFetcher: async (communitySlug: string) => {
          const community = await GetCommunityDetailsAction(communitySlug)
          return community?.title || communitySlug
        },
        children: [
          { path: "/settings", label: "Settings" },
          { path: "/users", label: "Users" }
        ]
      }
    ]
  },

  {
    path: "/channels",
    label: "Channels",
    children: [
      {
        path: "/[channel_slug]",
        dynamicLabelFetcher: async (channelSlug: string) => {
          const channel = await GetChannelBySlugAction(channelSlug)
          return channel?.data?.channel_name || channelSlug
        },
        children: [
          {
            path: "/spaces",
            label: "Spaces",
            children: [
              {
                path: "/[space_slug]",
                dynamicLabelFetcher: async (
                  spaceSlug: string,
                  allParams?: Record<string, string | string[]>
                ) => {
                  const channelSlug = allParams?.["channel_slug"] as string

                  if (!channelSlug) {
                    console.error(
                      "channel_slug not found in params for GetSpaceBySlugAction"
                    )
                    return spaceSlug
                  }
                  const space = await GetSpaceBySlugAction(
                    spaceSlug,
                    channelSlug
                  )
                  return space?.data?.space_name || spaceSlug
                },
                children: [
                  { path: "/users", label: "Users" },
                  { path: "/settings", label: "Settings" },
                  { path: "/projects", label: "Projects" }
                ]
              }
            ]
          },
          { path: "/users", label: "Users" },
          { path: "/settings", label: "Settings" }
        ]
      }
    ]
  },

  {
    path: "/project",
    children: [
      {
        path: "/[id]",
        dynamicLabelFetcher: async (projectId, params) => {
          try {
            const projectData = await GetProjectByIdAction(projectId, true)

            if (!projectData || !projectData.data) {
              return null
            }
            const project = projectData.data
            const channel = project.channel
            const space = project.space

            const crumbs: Array<{ label: string; href?: string }> = []

            if (channel && space) {
              crumbs.push({
                label: "Space",
                href: `/channels/${channel.channel_slug || channel.id}/spaces`
              })
              crumbs.push({
                label: space.space_name,
                href: `/channels/${channel.channel_slug || channel.id}/spaces/${space.space_slug || space.id}`
              })
            }

            crumbs.push({
              label: "Project",
              href: `/project/${project.id}`
            })

            if (project) {
              crumbs.push({
                label: project.project_name,
                href: `/project/${project.id}`
              })
            }

            return crumbs
          } catch (error) {
            console.error(
              "Error fetching project related breadcrumb details via GetProjectByIdAction:",
              error
            )
            return null
          }
        },
        children: [
          {
            path: "/board",
            label: "Board"
          },
          {
            path: "/list",
            label: "List"
          },
          {
            path: "/calendar",
            label: "Calendar"
          },
          {
            path: "/files",
            label: "Files"
          },
          {
            path: "/chat",
            label: "Chat"
          }
        ]
      }
    ]
  },

  {
    path: "/admin",
    label: "Admin",
    children: [
      {
        path: "/admin",
        label: "Dashboard",
        children: [
          {
            path: "/roles",
            label: "Roles",
            children: [
              {
                path: "/[id]",
                dynamicLabelFetcher: async (roleId: string) => {
                  const role = await GetRoleWithPermissionsAction(
                    Number(roleId)
                  )
                  return role?.data?.name || `Role ${roleId}`
                },
                children: [
                  { path: "/assign-users", label: "Assign Users" },
                  { path: "/edit", label: "Edit" }
                ]
              }
            ]
          },
          { path: "/users", label: "Users" },
          { path: "/settings", label: "Settings" }
        ]
      }
    ]
  }
]
