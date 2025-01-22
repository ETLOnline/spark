import { SelectUser, SelectUserContact } from "@/src/db/schema"

export interface ProfileActivity extends SelectUserContact {
  otherUser: SelectUser
}
