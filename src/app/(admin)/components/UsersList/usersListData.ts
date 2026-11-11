// Types and display config for the admin Users list

export type UserVerification = "verified" | "unverified"

export const USER_VERIFICATION_OPTIONS: {
  value: "all" | UserVerification
  label: string
}[] = [
  { value: "all", label: "All" },
  { value: "verified", label: "Verified" },
  { value: "unverified", label: "Unverified" }
]

export const USER_VERIFICATION_BADGES: Record<
  UserVerification,
  { label: string; className: string }
> = {
  verified: {
    label: "Verified",
    className:
      "border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
  },
  unverified: {
    label: "Unverified",
    className: "border-transparent bg-muted text-muted-foreground"
  }
}
