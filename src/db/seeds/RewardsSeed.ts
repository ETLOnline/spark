import { db } from ".."
import {
  activityRulesTable,
  InsertActivityRules,
  InsertRewardsMetadata,
  rewardsMetadataTable
} from "../schema"

const rewardsMetadata: InsertRewardsMetadata[] = [
  {
    reward_id: 1,
    internal_name: "reputation_points",
    display_name: "Reputation Points",
    is_soulbound: true,
    has_decay: true,
    decay_period: 15
  },
  {
    reward_id: 2,
    internal_name: "spark_credits",
    display_name: "Spark Credits",
    is_soulbound: false,
    has_decay: false,
    decay_period: 0
  }
]

const activityRules: InsertActivityRules[] = [
  // ── Spark Credits (reward_id: 2) ──────────────────────────────────────────
  {
    rule_id: 1,
    action_type: "profile_complete",
    reward_id: 2,
    base_points: 50,
    category_group: "onboarding",
    required_verification: false,
    is_active: true,
    description: "One-time SC reward for completing profile to 100%"
  },
  {
    rule_id: 2,
    action_type: "attend_public_webinar",
    reward_id: 2,
    base_points: 10,
    category_group: "engagement",
    required_verification: false,
    is_active: true,
    description: "SC per verified hour attending a public webinar (monthly cap applies)"
  },
  {
    rule_id: 3,
    action_type: "attend_community_session",
    reward_id: 2,
    base_points: 10,
    category_group: "attendance",
    required_verification: false,
    is_active: true,
    description: "SC per verified hour attending a community voice/video session"
  },
  {
    rule_id: 4,
    action_type: "community_service",
    reward_id: 2,
    base_points: 30,
    category_group: "community_service",
    required_verification: true,
    is_active: true,
    description: "SC for admin-approved community service (moderation or event organising)"
  },
  {
    rule_id: 5,
    action_type: "social_sharing",
    reward_id: 2,
    base_points: 5,
    category_group: "social",
    required_verification: false,
    is_active: true,
    description: "SC for verified internal media share (monthly cap applies)"
  },
  {
    rule_id: 6,
    action_type: "successful_referral",
    reward_id: 2,
    base_points: 25,
    category_group: "referral",
    required_verification: false,
    is_active: true,
    description: "SC awarded after referred friend completes their profile"
  },

  // ── Reputation Points – Student (reward_id: 1) ────────────────────────────
  {
    rule_id: 7,
    action_type: "merged_pull_request",
    reward_id: 1,
    base_points: 30,
    category_group: "technical",
    required_verification: true,
    is_active: true,
    description: "RP for a merged PR in an official FYP repository"
  },
  {
    rule_id: 8,
    action_type: "issue_resolution",
    reward_id: 1,
    base_points: 20,
    category_group: "technical",
    required_verification: true,
    is_active: true,
    description: "RP for a verified issue resolution approved by advisor"
  },
  {
    rule_id: 9,
    action_type: "milestone_deployment",
    reward_id: 1,
    base_points: 40,
    category_group: "technical",
    required_verification: true,
    is_active: true,
    description: "RP for a successful FYP milestone deployment after advisor approval"
  },
  {
    rule_id: 10,
    action_type: "peer_review",
    reward_id: 1,
    base_points: 10,
    category_group: "peer_review",
    required_verification: true,
    is_active: true,
    description: "RP for a peer review marked helpful by recipient (anti-collusion enforced)"
  },
  {
    rule_id: 11,
    action_type: "milestone_approved",
    reward_id: 1,
    base_points: 40,
    category_group: "milestone",
    required_verification: true,
    is_active: true,
    description: "RP awarded to student when their milestone is approved by an advisor"
  },
  {
    rule_id: 12,
    action_type: "mentorship_session_student",
    reward_id: 1,
    base_points: 5,
    category_group: "mentorship",
    required_verification: true,
    is_active: true,
    description: "RP for student after a verified mentorship session with feedback"
  },

  // ── Reputation Points – Advisor (reward_id: 1) ────────────────────────────
  {
    rule_id: 13,
    action_type: "advisor_milestone_verified",
    reward_id: 1,
    base_points: 5,
    category_group: "verification",
    required_verification: true,
    is_active: true,
    description: "RP for advisor after verifying and approving a student milestone"
  },
  {
    rule_id: 14,
    action_type: "advisor_student_rated",
    reward_id: 1,
    base_points: 15,
    category_group: "teaching",
    required_verification: true,
    is_active: true,
    description: "RP for advisor when a student rates them 4 stars or above"
  },
  {
    rule_id: 15,
    action_type: "advisor_mentorship_session",
    reward_id: 1,
    base_points: 20,
    category_group: "mentorship",
    required_verification: true,
    is_active: true,
    description: "RP for advisor after a verified mentorship session with feedback"
  }
]

export const RewardsSeed = async () => {
  return await db.transaction(async (tx) => {
    try {
      // Delete in order to respect foreign keys
      await tx.delete(activityRulesTable)
      await tx.delete(rewardsMetadataTable)

      await tx.insert(rewardsMetadataTable).values(rewardsMetadata)
      await tx.insert(activityRulesTable).values(activityRules)

      console.log("✅ Rewards metadata and activity rules seeded successfully")
    } catch (e) {
      console.error(e)
      tx.rollback()
      console.log("❌ Error seeding rewards")
      process.exit(1)
    }
  })
}