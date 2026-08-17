"use server"
import { IsPersonalEmailDomain } from "@/src/db/data-access/personal-email-domains/query"
import { CreateServerAction } from ".."

export const isPersonalEmailDomainAction = CreateServerAction(
  true,
  async (domain: string) => {
    const isPersonalEmailDomain = await IsPersonalEmailDomain(domain)
    return isPersonalEmailDomain
  }
)
