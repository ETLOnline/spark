import { ActivityTypes } from "@/src/types/Rewards/rewards";
import { db } from "..";
import {
  activityRulesTable,
  InsertActivityRules,
  InsertRewardsMetadata,
  rewardsMetadataTable,
} from "../schema";
import { inArray, not, eq } from "drizzle-orm";

// --------------------------
// Reward Data (NO IDs)
// --------------------------
const rewardsMetadata: InsertRewardsMetadata[] = [
  {
    internal_name: "reputation_points",
    display_name: "Reputation Points",
    is_soulbound: true,
    has_decay: true,
    decay_period: 15,
  },
  {
    internal_name: "spark_credits",
    display_name: "Spark Credits",
    is_soulbound: false,
    has_decay: false,
    decay_period: 0,
  },
];

// --------------------------
// Activity Rules (NO IDs)
// --------------------------
const activityRulesBase: Array<Omit<InsertActivityRules, "reward_id">> = [
  {
    action_type: ActivityTypes.ProfileComplete,
    base_points: 50,
    category_group: "onboarding",
    required_verification: false,
    is_active: true,
    description: "One-time SC reward for completing profile to 100%",
  },
  {
    action_type: ActivityTypes.EventCreation,
    base_points: 20,
    category_group: "event",
    required_verification: false,
    is_active: true,
    description: "SC for creating a new event",
  },
  {
    action_type: ActivityTypes.AttendCommunitySession,
    base_points: 10,
    category_group: "attendance",
    required_verification: false,
    is_active: true,
    description: "SC per verified hour attending a community voice/video session",
  },
  {
    action_type: ActivityTypes.CommunityService,
    base_points: 30,
    category_group: "community_service",
    required_verification: true,
    is_active: true,
    description: "SC for admin-approved community service",
  },
  {
    action_type: ActivityTypes.SocialPost,
    base_points: 15,
    category_group: "social",
    required_verification: false,
    is_active: true,
    description: "SC for verified internal media share",
  },
  {
    action_type: ActivityTypes.MergedPullRequest,
    base_points: 30,
    category_group: "technical",
    required_verification: true,
    is_active: true,
    description: "RP for a merged PR in an official FYP repository",
  },
  {
    action_type: ActivityTypes.IssueResolution,
    base_points: 20,
    category_group: "technical",
    required_verification: true,
    is_active: true,
    description: "RP for verified issue resolution",
  },
  {
    action_type: ActivityTypes.MilestoneDeployment,
    base_points: 40,
    category_group: "milestone",
    required_verification: true,
    is_active: true,
    description: "RP for successful milestone deployment",
  },
  {
    action_type: ActivityTypes.PeerReview,
    base_points: 10,
    category_group: "peer_review",
    required_verification: true,
    is_active: true,
    description: "RP for helpful peer review",
  },
  {
    action_type: ActivityTypes.MilestoneApproval,
    base_points: 40,
    category_group: "milestone",
    required_verification: false,
    is_active: true,
    description: "RP when milestone is approved",
  },
  {
    action_type: ActivityTypes.MentorshipSessionStudent,
    base_points: 5,
    category_group: "mentorship",
    required_verification: true,
    is_active: true,
    description: "RP for student after mentorship session",
  },
  {
    action_type: ActivityTypes.MilestoneVerified,
    base_points: 5,
    category_group: "milestone",
    required_verification: false,
    is_active: true,
    description: "RP for advisor verifying milestone",
  },
  {
    action_type: ActivityTypes.AdvisorStudentRated,
    base_points: 15,
    category_group: "teaching",
    required_verification: true,
    is_active: true,
    description: "RP for advisor rated 4+ stars",
  },
  {
    action_type: ActivityTypes.AdvisorMentorshipSession,
    base_points: 20,
    category_group: "mentorship",
    required_verification: true,
    is_active: true,
    description: "RP for advisor after mentorship session",
  },
  {
    action_type: ActivityTypes.TaskInprogress,
    base_points: 10,
    category_group: "engagement",
    required_verification: false,
    is_active: true,
    description: "SC when task is in progress",
  },
  {
    action_type: ActivityTypes.TaskCompletion,
    base_points: 20,
    category_group: "technical",
    required_verification: true,
    is_active: true,
    description: "RP for completed task",
  },
  {
    action_type: ActivityTypes.ChannelCreation,
    base_points: 15,
    category_group: "community_service",
    required_verification: false,
    is_active: true,
    description: "SC for creating channel",
  },
  {
    action_type: ActivityTypes.SpaceCreation,
    base_points: 15,
    category_group: "community_service",
    required_verification: false,
    is_active: true,
    description: "SC for creating space",
  },
  {
    action_type: ActivityTypes.ProjectCreation,
    base_points: 15,
    category_group: "community_service",
    required_verification: false,
    is_active: true,
    description: "SC for creating project",
  },
  {
    action_type: ActivityTypes.SpaceFeatureUpdate,
    base_points: 15,
    category_group: "community_service",
    required_verification: false,
    is_active: true,
    description: "SC for updating space features",
  },
  {
    action_type: ActivityTypes.SpaceOverviewUpdate,
    base_points: 50,
    category_group: "community_service",
    required_verification: false,
    is_active: true,
    description: "SC for updating space overview",
  },
  {
    action_type: ActivityTypes.SpaceFileShare,
    base_points: 20,
    category_group: "community_service",
    required_verification: false,
    is_active: true,
    description: "SC for sharing files in space",
  },
  {
    action_type: ActivityTypes.SpaceGroupChatCreation,
    base_points: 20,
    category_group: "community_service",
    required_verification: false,
    is_active: true,
    description: "SC for group chat in space",
  },
  {
    action_type: ActivityTypes.SocialPostLike,
    base_points: 1,
    category_group: "social",
    required_verification: false,
    is_active: true,
    description: "SC for post like",
  },
  {
    action_type: ActivityTypes.SocialPostComment,
    base_points: 5,
    category_group: "social",
    required_verification: false,
    is_active: true,
    description: "SC for post comment",
  },
  {
    action_type: ActivityTypes.SuccessfulReferral,
    base_points: 25,
    category_group: "referral",
    required_verification: false,
    is_active: true,
    description: "SC after referral completes profile",
  },
  {
    action_type: ActivityTypes.EventRegistration,
    base_points: 10,
    category_group: "event",
    required_verification: false,
    is_active: true,
    description: "SC for registering for event",
  },
];

// --------------------------
// FINAL SEEDER (NO GAPS, NO TYPE ERRORS, STABLE IDS)
// --------------------------
export const RewardsSeed = async () => {
  await db.transaction(async (tx) => {
    try {
      // --------------------------
      // Step 1: Sync Rewards (No Gaps)
      // --------------------------
      const rewardInternalNames = rewardsMetadata.map(r => r.internal_name);
      // Delete only removed rewards
      await tx.delete(rewardsMetadataTable)
        .where(not(inArray(rewardsMetadataTable.internal_name, rewardInternalNames)));

      // Update existing rewards first (no sequence usage)
      for (const reward of rewardsMetadata) {
        await tx.update(rewardsMetadataTable)
          .set(reward)
          .where(eq(rewardsMetadataTable.internal_name, reward.internal_name));
      }

      // Insert only new rewards (only these get new IDs)
      const existingRewards = await tx.select({ internal_name: rewardsMetadataTable.internal_name })
        .from(rewardsMetadataTable);
      const existingRewardNames = new Set(existingRewards.map(r => r.internal_name));
      const newRewards = rewardsMetadata.filter(r => !existingRewardNames.has(r.internal_name));
      if (newRewards.length > 0) {
        await tx.insert(rewardsMetadataTable).values(newRewards);
      }

      // Get mapped reward IDs
      const savedRewards = await tx.select().from(rewardsMetadataTable);
      const rewardMap = new Map(savedRewards.map(r => [r.internal_name, r.reward_id]));

      // --------------------------
      // Step 2: Build Activity Rules (100% Type-Safe)
      // --------------------------
      const activityRules = activityRulesBase.map(rule => {
        let reward_id: number;

        if (
          rule.action_type === ActivityTypes.MergedPullRequest ||
          rule.action_type === ActivityTypes.IssueResolution ||
          rule.action_type === ActivityTypes.MilestoneDeployment ||
          rule.action_type === ActivityTypes.PeerReview ||
          rule.action_type === ActivityTypes.MilestoneApproval ||
          rule.action_type === ActivityTypes.MentorshipSessionStudent ||
          rule.action_type === ActivityTypes.MilestoneVerified ||
          rule.action_type === ActivityTypes.AdvisorStudentRated ||
          rule.action_type === ActivityTypes.AdvisorMentorshipSession ||
          rule.action_type === ActivityTypes.TaskCompletion
        ) {
          reward_id = rewardMap.get("reputation_points")!;
        } else {
          reward_id = rewardMap.get("spark_credits")!;
        }

        return { ...rule, reward_id };
      });

      // --------------------------
      // Step 3: Sync Activity Rules (NO GAPS, NO SEQUENCE BLOAT)
      // --------------------------
      const actionTypes = activityRules.map(r => r.action_type);
      // Delete only removed rules
      await tx.delete(activityRulesTable)
        .where(not(inArray(activityRulesTable.action_type, actionTypes)));

      // Update existing rules first (no sequence usage)
      for (const rule of activityRules) {
        await tx.update(activityRulesTable)
          .set(rule)
          .where(eq(activityRulesTable.action_type, rule.action_type));
      }

      // Insert only new rules (only these get new IDs, appended at end)
      const existingRules = await tx.select({ action_type: activityRulesTable.action_type })
        .from(activityRulesTable);
      const existingActionTypes = new Set(existingRules.map(r => r.action_type));
      const newRules = activityRules.filter(r => !existingActionTypes.has(r.action_type));
      if (newRules.length > 0) {
        await tx.insert(activityRulesTable).values(newRules);
      }

      console.log("✅ Seeded successfully — NO GAPS, STABLE IDS, NO TYPE ERRORS");
    } catch (e) {
      console.error("❌ Error seeding rewards:", e);
      tx.rollback();
      process.exit(1);
    }
  });
};