import { and, asc, eq, ilike, or, SQL, sql, SQLWrapper } from "drizzle-orm"
import { db } from "../../.."
import { usersTable } from "../../../schema"

export interface GetAdminUsersFilters {
  role?: string
  verified?: boolean
  search?: string
  page?: number
  limit?: number
}

// Paginated users list for the admin Users page (live data, not snapshots).
// role = roles.name of a GLOBAL role; verified = profile.verified
export async function GetAdminUsers(filters: GetAdminUsersFilters) {
  const { role, verified, search, page = 1, limit = 10 } = filters

  const whereClause: (SQLWrapper | SQL | undefined)[] = []
  if (role) {
    whereClause.push(
      sql`exists (select 1 from user_roles ur join roles r on r.id = ur.role_id where ur.user_id = ${usersTable.unique_id} and r.role_type = 'GLOBAL' and r.name = ${role})`
    )
  }
  if (verified !== undefined) {
    const isVerified = sql`exists (select 1 from profile p where p.user_id = ${usersTable.unique_id} and p.verified)`
    whereClause.push(verified ? isVerified : sql`not ${isVerified}`)
  }
  if (search?.trim()) {
    const term = `%${search.trim()}%`
    whereClause.push(
      or(
        ilike(
          sql`trim(${usersTable.first_name}) || ' ' || trim(${usersTable.last_name})`,
          term
        ),
        ilike(usersTable.email, term)
      )
    )
  }
  const where = and(...whereClause)

  const [users, total] = await Promise.all([
    db.query.usersTable.findMany({
      where,
      limit,
      offset: (page - 1) * limit,
      orderBy: [asc(usersTable.first_name), asc(usersTable.last_name)],
      with: {
        profile: true,
        roles: { with: { role: true } }
      }
    }),
    db.$count(usersTable, where)
  ])

  return {
    users,
    pagination: {
      total: Number(total),
      page,
      limit,
      totalPages: Math.ceil(Number(total) / limit) || 1
    }
  }
}

// Marks a user as disabled / enabled (the Clerk ban is done in the server action)
export async function SetUserDisabled(userId: string, disabled: boolean) {
  const [user] = await db
    .update(usersTable)
    .set({ disabled })
    .where(eq(usersTable.unique_id, userId))
    .returning()
  return user
}
