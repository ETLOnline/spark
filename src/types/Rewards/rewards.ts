export enum RewardTypes {
  Reputation_Points = "reputation_points",
  Spark_Credits = "spark_credits"
}

export enum ActivityTypes {
  ProfileComplete = "profile_complete",
  AttendCommunitySession = "attend_community_session",
  CommunityService = "community_service",
  SocialPost = "social_post",
  SocialPostLike = "social_post_like",
  SocialPostComment = "social_post_comment",
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
  ChannelCreation = "channel_creation",
  SpaceCreation = "space_creation",
  ProjectCreation = "project_creation",
  SpaceFeatureUpdate = "space_feature_update",
  SpaceOverviewUpdate = "space_overview_update",
  SpaceFileShare = "space_file_share",
  SpaceGroupChatCreation = "space_group_chat_creation",
  EventCreation = "event_creation",
  EventRegistration = "event_registration"
}

export const ActivityDisplayNames: Record<string, string> = {
  // Community & Social
  [ActivityTypes.ProfileComplete]: "Profile Completion",
  [ActivityTypes.AttendCommunitySession]: "Community Session",
  [ActivityTypes.CommunityService]: "Community Service",
  [ActivityTypes.SocialPost]: "New Social Post",
  [ActivityTypes.SocialPostLike]: "Post Liked",
  [ActivityTypes.SocialPostComment]: "Post Commented",
  [ActivityTypes.SuccessfulReferral]: "User Referral",

  // Development & Technical
  [ActivityTypes.MergedPullRequest]: "Pull Request Merged",
  [ActivityTypes.IssueResolution]: "Issue Resolved",
  [ActivityTypes.MilestoneDeployment]: "Milestone Deployed",
  [ActivityTypes.PeerReview]: "Peer Review Completed",
  [ActivityTypes.MilestoneApproval]: "Milestone Approved",
  [ActivityTypes.MentorshipSessionStudent]: "Mentorship Attendance",

  // Tasks & Verification
  [ActivityTypes.MilestoneVerified]: "Milestone Verified",
  [ActivityTypes.AdvisorStudentRated]: "Student Rating",
  [ActivityTypes.AdvisorMentorshipSession]: "Mentorship Provided",
  [ActivityTypes.TaskCompletion]: "Task Completed",
  [ActivityTypes.TaskInprogress]: "Task Started",

  // Space & Channel Management
  [ActivityTypes.ChannelCreation]: "Channel Created",
  [ActivityTypes.SpaceCreation]: "Space Created",
  [ActivityTypes.ProjectCreation]: "Project Created",
  [ActivityTypes.SpaceFeatureUpdate]: "Space Feature Update",
  [ActivityTypes.SpaceOverviewUpdate]: "Overview Updated",
  [ActivityTypes.SpaceFileShare]: "File Shared",
  [ActivityTypes.SpaceGroupChatCreation]: "Group Chat Created",

  // Events
  [ActivityTypes.EventCreation]: "Event Created",
  [ActivityTypes.EventRegistration]: "Event Registration"
}

export enum TrustVerificationStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected"
}
