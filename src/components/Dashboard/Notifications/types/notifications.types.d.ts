export enum NotificationType {
  incomingRequestAcceptance = "incoming_req_accept",
  outgoingRequestAcceptance = "outgoing_req_accept",
  requestSent = "req_sent",
  follow = "follow",
  follower = "follower",
  like = "like",
  share = "share",
  comment = "comment",
  event = "event_created",
  visit = "profile_visit"
}

export enum NotificationEntity {
  post = "post",
  request = "request",
  profile = "profile"
}
