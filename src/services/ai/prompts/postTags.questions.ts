// Post-only TypeSafe questions. The moderation questions shared by every feature live in ./moderation.questions.ts.
// Each builder gets the state path of the post text, e.g. "post.text".

import { NoulQuestion, QuestionBuilder } from "../types/interface"
import { PostAiTag } from "../schemas/postCheck.schema"

// Positive tags shown on the post. Several can be true at once, so each is its own Noul.
export const POST_TAG_QUESTIONS = {
  helpful: (textPath: string): NoulQuestion => ({
    type: "noul",
    instructions: `Does \`${textPath}\` give other members practical advice, tips, a resource, or a how-to they can use?`,
    criteria: {
      true: "Readers can take something useful away, e.g. a tutorial link, study tips, or steps to fix a bug.",
      false:
        "The post is only about the author, or asks a question without sharing anything useful."
    }
  }),
  impressive: (textPath: string): NoulQuestion => ({
    type: "noul",
    instructions: `Does \`${textPath}\` announce a notable accomplishment by the author?`,
    criteria: {
      true: "The author shares a milestone such as launching a project, earning a certification, winning a competition, or landing a job.",
      false:
        "The post shares no accomplishment, or only small day-to-day progress like finishing one lesson."
    }
  }),
  productive: (textPath: string): NoulQuestion => ({
    type: "noul",
    instructions: `Does \`${textPath}\` describe concrete progress the author made on their work or studies?`,
    criteria: {
      true: "The author reports specific things they built, finished, or learned, e.g. 'finished the auth module today'.",
      false: "The post does not report any work or study progress."
    }
  }),
  interesting_idea: (textPath: string): NoulQuestion => ({
    type: "noul",
    instructions: `Does \`${textPath}\` share an original idea, insight, or point of view that could start a discussion?`,
    criteria: {
      true: "The author proposes an idea, a new way to do something, or a thoughtful opinion.",
      false:
        "The post only reports news, progress, or a question, with no idea or opinion of the author's own."
    }
  }),
  inspiring: (textPath: string): NoulQuestion => ({
    type: "noul",
    instructions: `Does \`${textPath}\` encourage or motivate other members?`,
    criteria: {
      true: "The post aims to uplift readers, e.g. a story of overcoming a challenge or words of encouragement.",
      false: "The post does not try to motivate anyone."
    }
  }),
  asking_for_help: (textPath: string): NoulQuestion => ({
    type: "noul",
    instructions: `Is the author of \`${textPath}\` asking the community for help, feedback, or advice?`,
    criteria: {
      true: "The author asks a question or requests feedback, e.g. 'how do I deploy this?' or 'thoughts on my design?'.",
      false: "The author asks nothing of readers."
    }
  }),
  opportunity: (textPath: string): NoulQuestion => ({
    type: "noul",
    instructions: `Does \`${textPath}\` share an opportunity members can apply for or join, such as a job, internship, scholarship, event, or program?`,
    criteria: {
      true: "Readers could apply, register, or join something mentioned in the post.",
      false:
        "Nothing in the post is open for readers to apply to or join. Paid advertising for unrelated products counts as false."
    }
  }),

  // Products
  product: (textPath: string): NoulQuestion => ({
    type: "noul",
    instructions: `Is \`${textPath}\` about a product, such as launching, showing, selling or asking about one?`
  }),
  product_launch: (textPath: string): NoulQuestion => ({
    type: "noul",
    instructions: `Is the author of \`${textPath}\` announcing that they launched or released a new product or feature?`
  }),
  feedback_request: (textPath: string): NoulQuestion => ({
    type: "noul",
    instructions: `Is the author of \`${textPath}\` asking others for feedback on their product, idea or work?`
  }),

  // Mentorship
  mentor_request: (textPath: string): NoulQuestion => ({
    type: "noul",
    instructions: `Is the author of \`${textPath}\` looking for a mentor or asking for mentorship?`
  }),
  mentor_offer: (textPath: string): NoulQuestion => ({
    type: "noul",
    instructions: `Is the author of \`${textPath}\` offering to mentor or advise others?`
  }),

  // Events
  event: (textPath: string): NoulQuestion => ({
    type: "noul",
    instructions: `Is \`${textPath}\` about an event, such as a meetup, webinar, workshop, conference or hackathon?`
  }),
  event_invite: (textPath: string): NoulQuestion => ({
    type: "noul",
    instructions: `Is the author of \`${textPath}\` inviting people to join or register for an event?`
  }),

  // Software and tech
  software: (textPath: string): NoulQuestion => ({
    type: "noul",
    instructions: `Is \`${textPath}\` about software, apps, coding, or tech tools and platforms?`
  }),
  ai: (textPath: string): NoulQuestion => ({
    type: "noul",
    instructions: `Is \`${textPath}\` about artificial intelligence, machine learning or AI tools?`
  }),
  technical_help: (textPath: string): NoulQuestion => ({
    type: "noul",
    instructions: `Is the author of \`${textPath}\` asking for help with a technical problem, bug or error?`
  }),

  // People and opportunities
  cofounder_search: (textPath: string): NoulQuestion => ({
    type: "noul",
    instructions: `Is the author of \`${textPath}\` looking for a co-founder or partner to build something with?`
  }),
  hiring: (textPath: string): NoulQuestion => ({
    type: "noul",
    instructions: `Is the author of \`${textPath}\` hiring, or sharing a job or internship opening?`
  }),
  job_search: (textPath: string): NoulQuestion => ({
    type: "noul",
    instructions: `Is the author of \`${textPath}\` looking for a job, internship or freelance work?`
  }),
  collaboration: (textPath: string): NoulQuestion => ({
    type: "noul",
    instructions: `Is the author of \`${textPath}\` looking for people to collaborate with on a project?`
  }),
  funding: (textPath: string): NoulQuestion => ({
    type: "noul",
    instructions: `Is \`${textPath}\` about funding, investors, fundraising or grants?`
  }),

  // Knowledge sharing
  learning_resource: (textPath: string): NoulQuestion => ({
    type: "noul",
    instructions: `Is the author of \`${textPath}\` sharing a tutorial, course, article or other learning resource?`
  }),
  question: (textPath: string): NoulQuestion => ({
    type: "noul",
    instructions: `Is the author of \`${textPath}\` asking a general question to the community?`
  })
} satisfies Record<PostAiTag, QuestionBuilder>
