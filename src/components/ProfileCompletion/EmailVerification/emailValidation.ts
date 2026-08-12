import { z } from "zod"
import { isPersonalEmailDomainAction } from "@/src/server-actions/personalEmailDomain/personalEmailDomain"

export const NON_PERSONAL_EMAIL_MESSAGE =
  "Personal email providers (Gmail, Yahoo, Outlook, etc.) aren't accepted. Please use your school, university, or company email."

export async function isPersonalEmailDomain(email: string) {
  const domain = email.split("@")[1]?.toLowerCase().trim()
  const res = await isPersonalEmailDomainAction(domain)

  return !!domain && res
}

export const verificationEmailSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .refine((email) => !isPersonalEmailDomain(email), {
      message: NON_PERSONAL_EMAIL_MESSAGE
    })
})

export type VerificationEmailFormValues = z.infer<
  typeof verificationEmailSchema
>
