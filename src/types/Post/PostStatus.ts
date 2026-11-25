export enum PostStatus {
  PUBLISHED = "published",
  // held by the AI check, visible only to the author until an admin reviews it
  PENDING_REVIEW = "pending_review",
  // rejected by an admin, hidden from everyone
  REJECTED = "rejected"
}
