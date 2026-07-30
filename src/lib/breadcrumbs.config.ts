import { GetCommunityDetailsAction } from "@/src/server-actions/Community/Community"
import { GetChannelBySlugAction } from "@/src/server-actions/Channel/Channel"
import { GetSpaceBySlugAction } from "@/src/server-actions/Space/Space"
import { GetProjectByIdAction } from "@/src/server-actions/ProjectManagement/projectManagement"
import { GetRoleWithPermissionsAction } from "@/src/server-actions/UserRoles/UserRole"
import { GetEventByIdAction } from "@/src/server-actions/events/event"
import { FindUserByUniqueIdAction } from "@/src/server-actions/User/FindUserByUniqueIdAction"

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
  /**
   * Optional override for the breadcrumb link target when this segment's
   * own URL path doesn't resolve to a real page (e.g. a static segment
   * that should link elsewhere instead of its own non-existent route).
   */
  href?: string
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
  {
    path: "/events",
    label: "Events",
    children: [
      {
        path: "/[event_id]",
        dynamicLabelFetcher: async (eventId: string) => {
          try {
            const res = await GetEventByIdAction(Number(eventId))
            return res?.data?.[0]?.title || eventId
          } catch {
            return eventId
          }
        }
      }
    ]
  },

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
    children: [
      {
        path: "/[channel_slug]",
        dynamicLabelFetcher: async (channelSlug: string) => {
          const channelResult = await GetChannelBySlugAction(channelSlug)
          if (!channelResult || !channelResult.data) {
            return null
          }
          const community = channelResult.data.community
          const channel = channelResult.data
          if (!community || !channel) {
            return null
          }
          const crumbs: Array<{ label: string; href?: string }> = []
          crumbs.push({
            label: "Channels",
            href: `/communities/${community.slug}`
          })
          crumbs.push({
            label: channel.channel_name,
            href: `/channels/${channel.channel_slug}/spaces/`
          })

          return crumbs
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

            if (!channel || !space) {
              return null
            }
            crumbs.push({
              label: "Spaces",
              href: `/channels/${channel.channel_slug}/spaces`
            })
            crumbs.push({
              label: space.space_name,
              href: `/channels/${channel.channel_slug}/spaces/${space.space_slug}`
            })

            crumbs.push({
              label: "Projects",
              href: `/channels/${channel.channel_slug}/spaces/${space.space_slug}?page-type=project-management`
            })

            if (project) {
              crumbs.push({
                label: project.project_name,
                href: `/project/${project.id}/board`
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
            path: "/sprint",
            label: "Sprint"
          },
          {
            path: "/backlog",
            label: "Backlog"
          },
          {
            path: "/teams",
            label: "Teams"
          },
          {
            path: "/settings",
            label: "Settings"
          },
          {
            path: "/task",
            label: "Task"
          }
        ]
      }
    ]
  },

  {
    path: "/mentorship",
    label: "Mentorship",
    href: "/mentors",
    children: [
      {
        path: "/[userId]",
        dynamicLabelFetcher: async (userId: string) => {
          try {
            const res = await FindUserByUniqueIdAction(userId)
            const user = res?.data
            const label = user
              ? `${user.first_name} ${user.last_name}`.trim() || userId
              : userId
            return [{ label, href: `/profile/${userId}` }]
          } catch {
            return [{ label: userId, href: `/profile/${userId}` }]
          }
        },
        children: [
          {
            path: "/spaces",
            label: "Spaces",
            children: [
              {
                path: "/[space_slug]",
                dynamicLabelFetcher: async (spaceSlug: string) => {
                  try {
                    const space = await GetSpaceBySlugAction(
                      spaceSlug,
                      "",
                      true
                    )
                    return space?.data?.space_name || spaceSlug
                  } catch {
                    return spaceSlug
                  }
                }
              }
            ]
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
