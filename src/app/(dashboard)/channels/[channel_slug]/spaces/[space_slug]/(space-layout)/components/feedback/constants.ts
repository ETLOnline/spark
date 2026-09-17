export type FeedbackFieldType =
  | "rating"
  | "single_choice"
  | "multi_choice"
  | "text"

export type FeedbackRole = "student" | "advisor"

export interface FeedbackField {
  key: string
  section: string
  question: string
  type: FeedbackFieldType
  placeholder?: string
  options?: string[]
  roles: FeedbackRole[]
}

// Section names are unnumbered here — the numbering shown to the user is
// derived from the role-filtered section list at render time, since the
// advisor form has an extra section (Project Outcome) the student form
// doesn't, which would otherwise throw off the numbering.
export const PROGRAM_FEEDBACK_FIELDS: FeedbackField[] = [
  {
    key: "overall_program_rating",
    section: "Program Experience",
    question: "Overall experience with the ETL FYP Advisory Program",
    type: "rating",
    roles: ["student", "advisor"]
  },
  {
    key: "guidance_satisfaction",
    section: "Program Experience",
    question:
      "Satisfaction with the guidance and support provided by the advisor",
    type: "rating",
    roles: ["student"]
  },
  {
    key: "team_engagement",
    section: "Program Experience",
    question: "Evaluation of the student team's engagement and commitment",
    type: "rating",
    roles: ["advisor"]
  },
  {
    key: "outcome_satisfaction",
    section: "Program Experience",
    question: "Satisfaction with the final project outcome",
    type: "rating",
    roles: ["advisor"]
  },
  {
    key: "contribution_level",
    section: "Program Experience",
    question: "How much the program contributed to the project's success?",
    type: "single_choice",
    options: ["Significantly", "Moderately", "Slightly", "Not at all"],
    roles: ["student"]
  },
  {
    key: "industry_relevant",
    section: "Project Outcome",
    question: "Whether the project is relevant to industry needs",
    type: "single_choice",
    options: ["Yes", "Partially", "No"],
    roles: ["advisor"]
  },
  {
    key: "project_potential",
    section: "Project Outcome",
    question: "The project's greatest potential",
    type: "single_choice",
    options: [
      "Startup / Entrepreneurial",
      "Industry Implementation",
      "Research & Academia",
      "Academic Project Only",
      "Other"
    ],
    roles: ["advisor"]
  },
  {
    key: "industry_ready_improvement",
    section: "Project Outcome",
    question:
      "The single most important improvement needed to make the project industry-ready (Optional)",
    type: "text",
    placeholder:
      "What's the one thing that would make this project industry-ready?",
    roles: ["advisor"]
  },
  {
    key: "spark_overall_rating",
    section: "SPARK Platform Feedback",
    question: "Overall experience with the SPARK platform",
    type: "rating",
    roles: ["student", "advisor"]
  },
  {
    key: "spark_features",
    section: "SPARK Platform Feedback",
    question: "Most useful SPARK features (Select all that apply)",
    type: "multi_choice",
    options: [
      "Project Management",
      "Team Chat",
      "Posts & Announcements",
      "File Sharing",
      "MoMs",
      "Milestones",
      "Other"
    ],
    roles: ["student", "advisor"]
  },
  {
    key: "spark_issues",
    section: "SPARK Platform Feedback",
    question: "Issues encountered while using SPARK (Optional)",
    type: "text",
    placeholder: "Share any issues or bugs you faced...",
    roles: ["student", "advisor"]
  },
  {
    key: "spark_suggestions",
    section: "SPARK Platform Feedback",
    question: "Feature or improvement suggestions for SPARK (Optional)",
    type: "text",
    placeholder: "What features or improvements would you like to see?",
    roles: ["student", "advisor"]
  },
  {
    key: "challenges",
    section: "Reflection & Improvement",
    question: "Challenges faced during the program (Optional)",
    type: "text",
    placeholder: "Share the main challenges you faced...",
    roles: ["student", "advisor"]
  },
  {
    key: "cohort_suggestions",
    section: "Reflection & Improvement",
    question: "Suggestions for improving future cohorts (Optional)",
    type: "text",
    placeholder: "Your suggestions can help us improve the program.",
    roles: ["student", "advisor"]
  },
  {
    key: "recommend_program",
    section: "Reflection & Improvement",
    question: "Would recommend the program to fellow students",
    type: "single_choice",
    options: ["Definitely", "Not Sure", "Definitely Not"],
    roles: ["student"]
  },
  {
    key: "future_cohort_interest",
    section: "Reflection & Improvement",
    question: "Interest in participating in future cohorts",
    type: "single_choice",
    options: ["Yes", "No", "Maybe"],
    roles: ["advisor"]
  }
]

export function getFeedbackFieldsForRole(role: FeedbackRole): FeedbackField[] {
  return PROGRAM_FEEDBACK_FIELDS.filter((f) => f.roles.includes(role))
}

export function getFeedbackSectionsForRole(role: FeedbackRole): string[] {
  return Array.from(
    new Set(getFeedbackFieldsForRole(role).map((f) => f.section))
  )
}
