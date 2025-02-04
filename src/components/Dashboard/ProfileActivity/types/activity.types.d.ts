import { SelectUser, SelectUserContact } from "@/src/db/schema"

export enum ActivityType {
  request = "connection-request",
  delRequest = "del-connection-request",
  acceptRequest = "connection-accepted"
}

export interface ProfileActivity extends SelectUserContact {
  otherUser: SelectUser
}

export enum ReqType {
  incoming = "received",
  outgoing = "sent"
}
