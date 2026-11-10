import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  notInArray,
  or,
  sql,
  SQLWrapper
} from "drizzle-orm"
import { db } from "../.."
import {
  advisorRequestsTable,
  fypMilestonesTable,
  permissionsTable,
  profileTable,
  programFeedbackTable,
  rolePermissionsTable,
  spacesTable,
  userRolesTable,
  usersTable
} from "../../schema"
import { ADVISOR_PERMISSION } from "../reporting/advisors/query"
import { AdvisorRequestStatus } from "@/src/types/AdvisorRequest/AdvisorRequest"
import { MilestoneStatus } from "@/src/types/Milestone/Milestone"
import { AdvisorFilter } from "@/src/types/Advisors/AdminAdvisors"
import { PaginationType } from "@/src/components/common/types/pagination.type"

// Admin drill-down queries behind the advisor KPI cards. Data comes through
// relations (db.query.*.findMany + `with`) and is paginated in the database
// (limit/offset + db.$count), like GetTasks. Filters use subqueries, never
// joins. The rules match the snapshot counts (reporting/advisors/query.ts):
//   - an advisor is anyone holding the advisor permission, whatever the role
//   - a project (FYP space) is completed when its last milestone is verified
//   - a project's advisor is whoever accepted its latest advisor request

/** Tag type an advisor's domains are stored as (same as the request-advisor domain picker). */
const DOMAIN_TAG_TYPE = "interest"

const likePattern = (search: string) =>
  `%${search.replace(/[\\%_]/g, (c) => `\\${c}`)}%`

const toPagination = (
  total: number,
  page: number,
  limit: number
): PaginationType => ({
  total,
  page,
  limit,
  totalPages: limit ? Math.ceil(total / limit) : 1
})

/** Domain tag names from a user's `userTags: { with: { tag } }`, alphabetical. */
const domainNames = (
  userTags: { tag: { name: string; type: string } | null }[] | undefined
) =>
  (userTags ?? [])
    .map((ut) => ut.tag)
    .filter((tag) => tag?.type === DOMAIN_TAG_TYPE)
    .map((tag) => tag!.name)
    .sort((a, b) => a.localeCompare(b))

type Request = { status: string; accepted_by: string | null }

/** The request a project shows: its latest accepted one, else its latest one. Expects newest first. */
const pickProjectRequest = <T extends Request>(requestsNewestFirst: T[]) =>
  requestsNewestFirst.find((r) => r.status === AdvisorRequestStatus.ACCEPTED) ??
  requestsNewestFirst[0]

/** The request's advisor id, only when the request was accepted. */
const acceptedAdvisorId = (request: Request | undefined) =>
  request?.status === AdvisorRequestStatus.ACCEPTED ? request.accepted_by : null

// ─── Subqueries (used inside `where: inArray(...)`) ──────────────────────────

/** Ids of users holding the advisor permission through any of their roles. */
const advisorUserIds = () =>
  db
    .select({ id: userRolesTable.user_id })
    .from(userRolesTable)
    .where(
      inArray(
        userRolesTable.role_id,
        db
          .select({ id: rolePermissionsTable.role_id })
          .from(rolePermissionsTable)
          .where(
            inArray(
              rolePermissionsTable.permission_id,
              db
                .select({ id: permissionsTable.id })
                .from(permissionsTable)
                .where(
                  and(
                    eq(
                      permissionsTable.namespace,
                      ADVISOR_PERMISSION.namespace
                    ),
                    eq(permissionsTable.action, ADVISOR_PERMISSION.action)
                  )
                )
            )
          )
      )
    )

/** Id of each space's last milestone: highest order_index, newest created breaks ties. */
const lastMilestoneIds = () =>
  db
    .selectDistinctOn([fypMilestonesTable.space_id], {
      id: fypMilestonesTable.id
    })
    .from(fypMilestonesTable)
    .orderBy(
      fypMilestonesTable.space_id,
      desc(fypMilestonesTable.order_index),
      desc(fypMilestonesTable.created_at)
    )

/** Spaces whose last milestone is verified (completed projects). */
const completedSpaceIds = () =>
  db
    .select({ id: fypMilestonesTable.space_id })
    .from(fypMilestonesTable)
    .where(
      and(
        inArray(fypMilestonesTable.id, lastMilestoneIds()),
        eq(fypMilestonesTable.status, MilestoneStatus.VERIFIED)
      )
    )

/** Id of each space's latest advisor request (a space can be re-requested after a rejection/expiry). */
const latestRequestIds = () =>
  db
    .selectDistinctOn([advisorRequestsTable.space_id], {
      id: advisorRequestsTable.id
    })
    .from(advisorRequestsTable)
    .orderBy(
      advisorRequestsTable.space_id,
      desc(advisorRequestsTable.created_at)
    )

/** Advisors assigned (latest request accepted) to >= 1 project that isn't completed. */
const activeAdvisorIds = () =>
  db
    .select({ id: advisorRequestsTable.accepted_by })
    .from(advisorRequestsTable)
    .where(
      and(
        inArray(advisorRequestsTable.id, latestRequestIds()),
        eq(advisorRequestsTable.status, AdvisorRequestStatus.ACCEPTED),
        notInArray(advisorRequestsTable.space_id, completedSpaceIds())
      )
    )

// ─── Advisors list ───────────────────────────────────────────────────────────

export interface AdminAdvisorsListFilters {
  filter: AdvisorFilter
  search?: string
  page: number
  limit: number
}

/** Ongoing / completed project counts for the given advisors (one page of them). */
const GetAdvisorProjectCounts = async (advisorIds: string[]) => {
  const counts = new Map<string, { active: number; completed: number }>()
  if (advisorIds.length === 0) return counts

  const assigned = await db.query.advisorRequestsTable.findMany({
    where: and(
      inArray(advisorRequestsTable.accepted_by, advisorIds),
      inArray(advisorRequestsTable.id, latestRequestIds()),
      eq(advisorRequestsTable.status, AdvisorRequestStatus.ACCEPTED)
    ),
    columns: { accepted_by: true, space_id: true }
  })
  if (assigned.length === 0) return counts

  const completed = await db.query.fypMilestonesTable.findMany({
    where: and(
      inArray(
        fypMilestonesTable.space_id,
        assigned.map((a) => a.space_id)
      ),
      inArray(fypMilestonesTable.id, lastMilestoneIds()),
      eq(fypMilestonesTable.status, MilestoneStatus.VERIFIED)
    ),
    columns: { space_id: true }
  })
  const completedSpaces = new Set(completed.map((m) => m.space_id))

  for (const { accepted_by, space_id } of assigned) {
    if (!accepted_by) continue
    const c = counts.get(accepted_by) ?? { active: 0, completed: 0 }
    if (completedSpaces.has(space_id)) c.completed++
    else c.active++
    counts.set(accepted_by, c)
  }
  return counts
}

/**
 * all      = every advisor
 * active   = assigned to >= 1 project whose last milestone isn't verified
 * verified = profile.verified
 * Search matches full name or email.
 */
export async function GetAdminAdvisorsList({
  filter,
  search,
  page,
  limit
}: AdminAdvisorsListFilters) {
  try {
    const offset = page && limit ? (page - 1) * limit : 0

    const whereClauses: (SQLWrapper | undefined)[] = [
      inArray(usersTable.unique_id, advisorUserIds())
    ]

    if (filter === "active") {
      whereClauses.push(inArray(usersTable.unique_id, activeAdvisorIds()))
    }

    if (filter === "verified") {
      whereClauses.push(
        inArray(
          usersTable.unique_id,
          db
            .select({ id: profileTable.user_id })
            .from(profileTable)
            .where(eq(profileTable.verified, true))
        )
      )
    }

    const q = search?.trim()
    if (q) {
      whereClauses.push(
        or(
          ilike(
            sql`concat_ws(' ', ${usersTable.first_name}, ${usersTable.last_name})`,
            likePattern(q)
          ),
          ilike(usersTable.email, likePattern(q))
        )
      )
    }

    const where = and(...whereClauses)

    const advisors = await db.query.usersTable.findMany({
      limit,
      offset,
      where,
      columns: {
        unique_id: true,
        first_name: true,
        last_name: true,
        email: true
      },
      orderBy: (usersTable, { asc }) => [
        asc(usersTable.first_name),
        asc(usersTable.last_name),
        asc(usersTable.unique_id)
      ],
      with: {
        profile: { columns: { linkedin_url: true } },
        userTags: { with: { tag: { columns: { name: true, type: true } } } }
      }
    })

    const [totalCount, projectCounts] = await Promise.all([
      db.$count(usersTable, where),
      GetAdvisorProjectCounts(advisors.map((a) => a.unique_id))
    ])

    return {
      advisors: advisors.map((a) => ({
        id: a.unique_id,
        firstName: a.first_name,
        lastName: a.last_name,
        email: a.email,
        linkedinUrl: a.profile?.linkedin_url?.trim() || null,
        domains: domainNames(a.userTags),
        activeProjects: projectCounts.get(a.unique_id)?.active ?? 0,
        completedProjects: projectCounts.get(a.unique_id)?.completed ?? 0
      })),
      pagination: toPagination(Number(totalCount), page || 1, limit)
    }
  } catch (e: any) {
    throw new Error(e.message)
  }
}

// ─── Completed projects ──────────────────────────────────────────────────────

export interface AdminCompletedProjectsFilters {
  search?: string
  page: number
  limit: number
}

/**
 * Projects whose last milestone is verified, newest completion first. One row
 * per project: the query runs on each project's last milestone. Search
 * matches the project title, space name or advisor name.
 */
export async function GetAdminCompletedFypProjects({
  search,
  page,
  limit
}: AdminCompletedProjectsFilters) {
  try {
    const offset = page && limit ? (page - 1) * limit : 0

    const whereClauses: (SQLWrapper | undefined)[] = [
      inArray(fypMilestonesTable.id, lastMilestoneIds()),
      eq(fypMilestonesTable.status, MilestoneStatus.VERIFIED)
    ]

    const q = search?.trim()
    if (q) {
      whereClauses.push(
        or(
          // project title
          inArray(
            fypMilestonesTable.space_id,
            db
              .select({ id: advisorRequestsTable.space_id })
              .from(advisorRequestsTable)
              .where(ilike(advisorRequestsTable.fyp_title, likePattern(q)))
          ),
          // space name
          inArray(
            fypMilestonesTable.space_id,
            db
              .select({ id: spacesTable.id })
              .from(spacesTable)
              .where(ilike(spacesTable.space_name, likePattern(q)))
          ),
          // advisor name
          inArray(
            fypMilestonesTable.space_id,
            db
              .select({ id: advisorRequestsTable.space_id })
              .from(advisorRequestsTable)
              .where(
                and(
                  eq(
                    advisorRequestsTable.status,
                    AdvisorRequestStatus.ACCEPTED
                  ),
                  inArray(
                    advisorRequestsTable.accepted_by,
                    db
                      .select({ id: usersTable.unique_id })
                      .from(usersTable)
                      .where(
                        ilike(
                          sql`concat_ws(' ', ${usersTable.first_name}, ${usersTable.last_name})`,
                          likePattern(q)
                        )
                      )
                  )
                )
              )
          )
        )
      )
    }

    const where = and(...whereClauses)

    // Completion = when the last milestone was last updated (i.e. verified).
    const lastMilestones = await db.query.fypMilestonesTable.findMany({
      limit,
      offset,
      where,
      columns: { space_id: true, updated_at: true, created_at: true },
      orderBy: (m, { asc }) => [
        sql`coalesce(${m.updated_at}, ${m.created_at})::timestamptz desc nulls last`,
        asc(m.space_id)
      ],
      with: {
        space: {
          columns: { id: true, space_name: true },
          with: {
            channel: {
              columns: { channel_name: true },
              with: { community: { columns: { title: true } } }
            }
          }
        }
      }
    })

    const spaceIds = lastMilestones.map((m) => m.space_id)
    const [totalCount, requests] = await Promise.all([
      db.$count(fypMilestonesTable, where),
      spaceIds.length
        ? db.query.advisorRequestsTable.findMany({
            where: inArray(advisorRequestsTable.space_id, spaceIds),
            columns: {
              space_id: true,
              fyp_title: true,
              group_members: true,
              status: true,
              accepted_by: true
            },
            orderBy: (r, { desc }) => [desc(r.created_at)],
            with: {
              advisor: { columns: { first_name: true, last_name: true } }
            }
          })
        : Promise.resolve([])
    ])

    const projects = lastMilestones.map((m) => {
      const request = pickProjectRequest(
        requests.filter((r) => r.space_id === m.space_id)
      )
      const advisor = acceptedAdvisorId(request) ? request?.advisor : null
      return {
        spaceId: m.space_id,
        requestTitle: request?.fyp_title ?? null,
        spaceName: m.space?.space_name ?? "",
        groupMembers: request?.group_members ?? null,
        advisorFirstName: advisor?.first_name ?? null,
        advisorLastName: advisor?.last_name ?? null,
        channelName: m.space?.channel?.channel_name ?? null,
        communityName: m.space?.channel?.community?.title ?? null,
        completedAt: m.updated_at ?? m.created_at
      }
    })

    return {
      projects,
      pagination: toPagination(Number(totalCount), page || 1, limit)
    }
  } catch (e: any) {
    throw new Error(e.message)
  }
}

// ─── Project details ─────────────────────────────────────────────────────────

/** The project (space) with its request, domain, place and advisor. */
export async function GetAdminFypProject(spaceId: string) {
  try {
    const [space, requests] = await Promise.all([
      db.query.spacesTable.findFirst({
        where: eq(spacesTable.id, spaceId),
        columns: { id: true, space_name: true },
        with: {
          channel: {
            columns: { channel_name: true },
            with: { community: { columns: { title: true } } }
          }
        }
      }),
      db.query.advisorRequestsTable.findMany({
        where: eq(advisorRequestsTable.space_id, spaceId),
        columns: {
          fyp_title: true,
          group_members: true,
          status: true,
          accepted_by: true
        },
        orderBy: (r, { desc }) => [desc(r.created_at)],
        with: {
          domain: { columns: { name: true } },
          advisor: {
            columns: {
              unique_id: true,
              first_name: true,
              last_name: true,
              email: true
            },
            with: {
              profile: { columns: { linkedin_url: true } },
              userTags: {
                with: { tag: { columns: { name: true, type: true } } }
              }
            }
          }
        }
      })
    ])

    if (!space) return undefined

    const request = pickProjectRequest(requests)
    const advisor = acceptedAdvisorId(request) ? request?.advisor : null

    return {
      spaceId: space.id,
      requestTitle: request?.fyp_title ?? null,
      spaceName: space.space_name,
      channelName: space.channel?.channel_name ?? null,
      communityName: space.channel?.community?.title ?? null,
      domain: request?.domain?.name ?? null,
      groupMembers: request?.group_members ?? null,
      advisor: advisor
        ? {
            id: advisor.unique_id,
            firstName: advisor.first_name,
            lastName: advisor.last_name,
            email: advisor.email,
            linkedinUrl: advisor.profile?.linkedin_url?.trim() || null,
            domains: domainNames(advisor.userTags)
          }
        : null
    }
  } catch (e: any) {
    throw new Error(e.message)
  }
}

/** Milestones in display order (order_index) with their files and links. */
export async function GetAdminFypMilestones(spaceId: string) {
  try {
    return await db.query.fypMilestonesTable.findMany({
      where: eq(fypMilestonesTable.space_id, spaceId),
      orderBy: [
        asc(fypMilestonesTable.order_index),
        asc(fypMilestonesTable.created_at)
      ],
      with: {
        artifacts: {
          with: { file: true },
          orderBy: (artifact, { asc }) => [asc(artifact.id)]
        }
      }
    })
  } catch (e: any) {
    throw new Error(e.message)
  }
}

/** Closure feedback for the space (its partner_rating is what profiles show). */
export async function GetAdminFypFeedback(spaceId: string) {
  try {
    return await db.query.programFeedbackTable.findMany({
      where: eq(programFeedbackTable.space_id, spaceId),
      orderBy: [asc(programFeedbackTable.created_at)],
      with: { submittedBy: true }
    })
  } catch (e: any) {
    throw new Error(e.message)
  }
}
