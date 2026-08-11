import { z } from "zod"

// Common free/personal email providers — students, faculty, and mentors must
// verify with a .edu, university, or company email instead.
const PERSONAL_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.in",
  "yahoo.co.uk",
  "ymail.com",
  "rocketmail.com",
  "hotmail.com",
  "hotmail.co.uk",
  "outlook.com",
  "live.com",
  "msn.com",
  "aol.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "protonmail.com",
  "proton.me",
  "mail.com",
  "zoho.com",
  "gmx.com",
  "yandex.com",
  "rediffmail.com",
  "inbox.com"
])

export const NON_PERSONAL_EMAIL_MESSAGE =
  "Personal email providers (Gmail, Yahoo, Outlook, etc.) aren't accepted. Please use your school, university, or company email."

export function isPersonalEmailDomain(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase().trim()
  return !!domain && PERSONAL_EMAIL_DOMAINS.has(domain)
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
