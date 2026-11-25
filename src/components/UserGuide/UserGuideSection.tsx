"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { LinkAsButton } from "@/src/components/LinkAsButton/LinkAsButton"
import { UserGuideVideoCard } from "./UserGuideVideoCard"
import { USER_GUIDE_PREVIEW_COUNT, USER_GUIDE_VIDEOS } from "./userGuideVideos"

/** Landing page section (#user-guide): a few videos + link to /user-guide. */
export function UserGuideSection() {
  const previewVideos = USER_GUIDE_VIDEOS.slice(0, USER_GUIDE_PREVIEW_COUNT)

  return (
    <section
      id="user-guide"
      className="py-24 px-6 bg-background dark:bg-background"
    >
      <div className="container mx-auto">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-8 text-foreground">
            Learn SPARK in
            <span className="bg-gradient-to-r from-primary via-primary-hover to-foreground bg-clip-text text-transparent">
              {" "}
              Minutes
            </span>
          </h2>
          <p className="text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Short video walkthroughs to help you get started and make the most
            of the platform
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {previewVideos.map((video, index) => (
            <UserGuideVideoCard key={index} video={video} />
          ))}
        </motion.div>

        <div className="mt-12 flex justify-center">
          <LinkAsButton href="/user-guide" size="lg">
            View full user guide
            <ArrowRight className="w-4 h-4" />
          </LinkAsButton>
        </div>
      </div>
    </section>
  )
}
