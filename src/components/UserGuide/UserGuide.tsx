import { UserGuideVideoCard } from "./UserGuideVideoCard"
import { USER_GUIDE_VIDEOS } from "./userGuideVideos"

/** Full /user-guide page: every user guide video. */
export default function UserGuide() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5 pt-32 pb-24 px-6">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-primary">
            User Guides
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Pick the video for your role and learn how to get started on SPARK,
            whether you are a student, mentee, mentor, or industry advisor.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {USER_GUIDE_VIDEOS.map((video, index) => (
            <UserGuideVideoCard key={index} video={video} />
          ))}
        </div>
      </div>
    </div>
  )
}
