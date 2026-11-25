/**
 * User guide videos shown on the landing page section and the /user-guide
 * page. Kept as a static list (no DB) — add, remove or reorder entries here.
 *
 * `url` is the YouTube video link and `thumbnail` its image
 * (https://i.ytimg.com/vi/<video id>/hqdefault.jpg). Leave `url` empty to
 * show a "coming soon" card.
 */
export interface UserGuideVideo {
  title: string
  description: string
  url: string
  thumbnail: string
}

export const USER_GUIDE_VIDEOS: UserGuideVideo[] = [
  {
    title: "Faculty User Guide",
    description:
      "Getting started with FYP Advisory on SPARK — a walkthrough for faculty members.",
    url: "https://youtu.be/0D9Czj-trLQ",
    thumbnail: "https://i.ytimg.com/vi/0D9Czj-trLQ/hqdefault.jpg"
  },
  {
    title: "Industry Advisor User Guide",
    description:
      "Getting started with FYP Advisory on SPARK — a walkthrough for industry advisors.",
    url: "https://youtu.be/ljqJtKzpIZs",
    thumbnail: "https://i.ytimg.com/vi/ljqJtKzpIZs/hqdefault.jpg"
  },
  {
    title: "Student User Guide",
    description:
      "Getting started with FYP Advisory on SPARK — a walkthrough for students.",
    url: "https://youtu.be/TDD4L4Kzsz8",
    thumbnail: "https://i.ytimg.com/vi/TDD4L4Kzsz8/hqdefault.jpg"
  },
  {
    title: "Mentee User Guide",
    description:
      "Getting started with SPARK as a mentee — find mentors and make the most of your sessions.",
    url: "https://youtu.be/WhNBZxN3kbo",
    thumbnail: "https://i.ytimg.com/vi/WhNBZxN3kbo/hqdefault.jpg"
  },
  {
    title: "Mentor User Guide",
    description:
      "Getting started with SPARK as a mentor — set up your profile and guide your mentees.",
    url: "https://youtu.be/6Es3TM4bEPA",
    thumbnail: "https://i.ytimg.com/vi/6Es3TM4bEPA/hqdefault.jpg"
  },
  {
    title: "Intro to Spark",
    description:
      "An introduction to SPARK by Usama Tariq — become a SPARK contributor.",
    url: "https://youtu.be/RKIWGZWAF98",
    thumbnail: "https://i.ytimg.com/vi/RKIWGZWAF98/hqdefault.jpg"
  },
  {
    title: "Spark Demo II",
    description: "Become a SPARK contributor — part two of the platform demo.",
    url: "https://youtu.be/_gpP-ccUaVM",
    thumbnail: "https://i.ytimg.com/vi/_gpP-ccUaVM/hqdefault.jpg"
  },
  {
    title: "Spark Demo I",
    description: "Become a SPARK contributor — part one of the platform demo.",
    url: "https://youtu.be/7g2FV84uhW4",
    thumbnail: "https://i.ytimg.com/vi/7g2FV84uhW4/hqdefault.jpg"
  }
]

/** Number of videos previewed in the landing page section. */
export const USER_GUIDE_PREVIEW_COUNT = 3
