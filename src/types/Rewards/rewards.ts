export enum ActivityTypes {
  ProfileComplete = "profile_complete",
  AttendCommunitySession = "attend_community_session",
  CommunityService = "community_service",
  SocialSharing = "social_sharing",
  SuccessfulReferral = "successful_referral",

  MergedPullRequest = "merged_pull_request",
  IssueResolution = "issue_resolution",
  MilestoneDeployment = "milestone_deployment",
  PeerReview = "peer_review",
  MilestoneApproval = "milestone_approval",
  MentorshipSessionStudent = "mentorship_session_student",

  MilestoneVerified = "milestone_verified",
  AdvisorStudentRated = "advisor_student_rated",
  AdvisorMentorshipSession = "advisor_mentorship_session",
  TaskCompletion = "task_completion",
  TaskInprogress = "task_inprogress",
  EventCreation = "event_creation",
  EventRegistration = "event_registration",
}

export enum TrustVerificationStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected"
}
