import { GetModerationPostsAction } from "@/src/server-actions/Post/PostModeration"

type ModerationPostsResponse = Awaited<
  ReturnType<typeof GetModerationPostsAction>
>

// A held or rejected post as the admin list gets it: author, poll options and files included
export type ModerationPost = NonNullable<
  ModerationPostsResponse["data"]
>["posts"][number]
