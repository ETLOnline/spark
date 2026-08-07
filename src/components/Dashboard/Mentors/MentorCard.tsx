"use client"

import Link from "next/link"
import { Star, Users, Building2, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/src/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { cn } from "@/src/lib/utils"
import type { SelectUser } from "@/src/db/schema"

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            "h-3.5 w-3.5",
            star <= Math.floor(rating)
              ? "fill-amber-400 text-amber-400"
              : star - 0.5 <= rating
                ? "fill-amber-300 text-amber-300"
                : "fill-muted text-muted-foreground/20"
          )}
        />
      ))}
    </div>
  )
}

export type MentorWithStats = SelectUser & { completedSessionsCount?: number }

interface MentorCardProps {
  mentor: MentorWithStats
}

export default function MentorCard({ mentor }: MentorCardProps) {
  const name = `${mentor.first_name} ${mentor.last_name}`.trim()
  const initials =
    `${mentor.first_name?.[0] ?? ""}${mentor.last_name?.[0] ?? ""}`.toUpperCase()
  const rating = Number(mentor.profile?.total_average_rating) || 0
  const reviewCount = mentor.profile?.number_of_ratings ?? 0
  const completedSessions = mentor.completedSessionsCount ?? 0

  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow border border-border rounded-2xl w-full">
      <div className="bg-muted px-4 pt-4 pb-10 rounded-t-2xl" />

      <div className="flex justify-center -mt-10 relative z-10">
        <Avatar className="h-20 w-20 border-4 border-card shrink-0">
          {mentor.profile_url ? (
            <AvatarImage src={mentor.profile_url} alt={name} />
          ) : null}
          <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>

      <CardContent className="bg-card rounded-b-2xl -mt-10 px-4 pt-12 pb-4 flex flex-col gap-3 flex-1 min-w-0">
        {/* Name / title / company */}
        <div className="text-center">
          <h3 className="font-bold text-base text-foreground truncate">
            {name}
          </h3>
          {mentor.profile?.professional_title && (
            <p className="text-sm text-muted-foreground mt-0.5 truncate">
              {mentor.profile.professional_title}
            </p>
          )}
          {mentor.profile?.company && (
            <div className="flex items-center justify-center gap-1 mt-1">
              <Building2 className="h-3 w-3 text-muted-foreground/70 shrink-0" />
              <span className="text-xs text-muted-foreground truncate">
                {mentor.profile.company}
              </span>
            </div>
          )}
        </div>

        {/* Stars + reviews */}
        <div className="flex items-center justify-between border-t border-border pt-3 gap-2">
          <div className="flex items-center gap-1.5 shrink-0">
            <StarRating rating={rating} />
            <span className="text-sm font-semibold text-foreground">
              {rating.toFixed(1)}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {reviewCount} reviews
          </span>
        </div>

        {/* Completed sessions */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5 shrink-0" />
          <span>{completedSessions} completed sessions</span>
        </div>

        {/* CTA */}
        <Link href={`/profile/${mentor.unique_id}`} className="mt-auto">
          <Button size="sm" className="w-full gap-1.5">
            View Profile
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
