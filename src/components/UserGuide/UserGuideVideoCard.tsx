import Image from "next/image"
import Link from "next/link"
import { ExternalLink, PlayCircle } from "lucide-react"
import { Card } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { LinkAsButton } from "@/src/components/LinkAsButton/LinkAsButton"
import { UserGuideVideo } from "./userGuideVideos"

/** One user guide video: YouTube thumbnail + "Watch Video" (opens YouTube). */
export function UserGuideVideoCard({ video }: { video: UserGuideVideo }) {
  return (
    <Card className="group h-full overflow-hidden rounded-2xl border border-border/50 shadow-sm hover:shadow-lg hover:border-primary/40 transition-all flex flex-col">
      <div className="relative aspect-video bg-muted overflow-hidden">
        {video.url ? (
          <Link
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Watch ${video.title} on YouTube (opens in new tab)`}
            className="absolute inset-0 block"
          >
            <Image
              src={video.thumbnail}
              alt={`${video.title} thumbnail`}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Play overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-xl transition-transform group-hover:scale-110">
                <PlayCircle className="h-10 w-10 text-primary" />
              </div>
            </div>
          </Link>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/10 to-primary/5">
            <PlayCircle className="h-12 w-12 text-primary/40" />
            <p className="text-sm font-medium text-muted-foreground">
              Coming soon
            </p>
          </div>
        )}
      </div>

      <div className="p-6 flex flex-1 flex-col justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold text-foreground">{video.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground dark:text-white leading-relaxed">
            {video.description}
          </p>
        </div>

        {video.url ? (
          <LinkAsButton
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl font-semibold"
            aria-label={`Watch ${video.title} on YouTube (opens in new tab)`}
          >
            Watch Video
            <ExternalLink className="h-4 w-4" />
          </LinkAsButton>
        ) : (
          <Button
            type="button"
            variant="secondary"
            disabled
            className="rounded-xl font-semibold"
          >
            Coming Soon
          </Button>
        )}
      </div>
    </Card>
  )
}
