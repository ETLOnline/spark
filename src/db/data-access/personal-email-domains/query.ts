import { eq } from "drizzle-orm"
import { db } from "../.."
import { personalEmailDomainsTable } from "../../schema"

export async function GetAllPersonalEmailDomains() {
  try {
    const rows = await db.select().from(personalEmailDomainsTable)
    return rows
  } catch (e: any) {
    throw new Error(e.message)
  }
}

export async function IsPersonalEmailDomain(domain: string) {
  try {
    const rows = await db
      .select()
      .from(personalEmailDomainsTable)
      .where(eq(personalEmailDomainsTable.domain, domain.toLowerCase()))

    return !!rows[0]
  } catch (e: any) {
    throw new Error(e.message)
  }
}
