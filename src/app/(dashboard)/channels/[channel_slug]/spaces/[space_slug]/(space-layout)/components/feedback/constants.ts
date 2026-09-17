export type FeedbackFieldType =
  | "rating"
  | "single_choice"
  | "multi_choice"
  | "text"

export interface FeedbackField {
  key: string
  section: string
  question: string
  type: FeedbackFieldType
  placeholder?: string
  options?: string[]
}

// All questions from both the student and advisor versions of the form,
// combined. Role-based filtering (which fields a given user should actually
// see) is deferred — for now every field renders for every submitter.
export const PROGRAM_FEEDBACK_FIELDS: FeedbackField[] = [
  {
    key: "overall_program_rating",
    section: "1. Program Experience",
    question: "Overall experience with the ETL FYP Advisory Program",
    type: "rating"
  },
  {
    key: "guidance_satisfaction",
    section: "1. Program Experience",
    question:
      "Satisfaction with the guidance and support provided by the advisor",
    type: "rating"
  },
  {
    key: "team_engagement",
    section: "1. Program Experience",
    question:
      "Evaluation of the student team's engagement and commitment",
    type: "rating"
  },
  {
    key: "outcome_satisfaction",
    section: "1. Program Experience",
    question: "Satisfaction with the final project outcome",
    type: "rating"
  },
  {
    key: "contribution_level",
    section: "1. Program Experience",
    question: "How much the program contributed to the project's success?",
    type: "single_choice",
    options: ["Significantly", "Moderately", "Slightly", "Not at all"]
  },
  {
    key: "industry_relevant",
    section: "2. Project Outcome",
    question: "Whether the project is relevant to industry needs",
    type: "single_choice",
    options: ["Yes", "Partially", "No"]
  },
  {
    key: "project_potential",
    section: "2. Project Outcome",
    question: "The project's greatest potential",
    type: "single_choice",
    options: [
      "Startup / Entrepreneurial",
      "Industry Implementation",
      "Research & Academia",
      "Academic Project Only",
      "Other"
    ]
  },
  {
    key: "industry_ready_improvement",
    section: "2. Project Outcome",
    question:
      "The single most important improvement needed to make the project industry-ready (Optional)",
    type: "text",
    placeholder: "What's the one thing that would make this project industry-ready?"
  },
  {
    key: "spark_overall_rating",
    section: "3. SPARK Platform Feedback",
    question: "Overall experience with the SPARK platform",
    type: "rating"
  },
  {
    key: "spark_features",
    section: "3. SPARK Platform Feedback",
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
    ]
  },
  {
    key: "spark_issues",
    section: "3. SPARK Platform Feedback",
    question: "Issues encountered while using SPARK (Optional)",
    type: "text",
    placeholder: "Share any issues or bugs you faced..."
  },
  {
    key: "spark_suggestions",
    section: "3. SPARK Platform Feedback",
    question: "Feature or improvement suggestions for SPARK (Optional)",
    type: "text",
    placeholder: "What features or improvements would you like to see?"
  },
  {
    key: "challenges",
    section: "4. Reflection & Improvement",
    question: "Challenges faced during the program (Optional)",
    type: "text",
    placeholder: "Share the main challenges you faced..."
  },
  {
    key: "cohort_suggestions",
    section: "4. Reflection & Improvement",
    question: "Suggestions for improving future cohorts (Optional)",
    type: "text",
    placeholder: "Your suggestions can help us improve the program."
  },
  {
    key: "recommend_program",
    section: "4. Reflection & Improvement",
    question: "Would recommend the program to fellow students",
    type: "single_choice",
    options: ["Definitely", "Not Sure", "Definitely Not"]
  },
  {
    key: "future_cohort_interest",
    section: "4. Reflection & Improvement",
    question: "Interest in participating in future cohorts",
    type: "single_choice",
    options: ["Yes", "No", "Maybe"]
  }
]

export const PROGRAM_FEEDBACK_SECTIONS = Array.from(
  new Set(PROGRAM_FEEDBACK_FIELDS.map((f) => f.section))
)
