"use client"

import Link from "next/link"
import { Star, Users, Building2, ArrowRight } from "lucide-react"
import { Card, CardContent } from "@/src/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { cn } from "@/src/lib/utils"
import { MentorData } from "./MentorTypes"

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

interface MentorCardProps {
  mentor: MentorData
}

export default function MentorCard({ mentor }: MentorCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow border border-border rounded-2xl w-full">
      <div className="bg-muted px-4 pt-4 pb-10 rounded-t-2xl" />

      <div className="flex justify-center -mt-10 relative z-10">
        <Avatar className="h-20 w-20 border-4 border-card shrink-0">
          {mentor.photo ? (
            <AvatarImage src={mentor.photo} alt={mentor.name} />
          ) : null}
          <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
            {mentor.initials}
          </AvatarFallback>
        </Avatar>
      </div>

      <CardContent className="bg-card rounded-b-2xl -mt-10 px-4 pt-12 pb-4 flex flex-col gap-3 flex-1 min-w-0">
        {/* Name / title / company */}
        <div className="text-center">
          <h3 className="font-bold text-base text-foreground truncate">
            {mentor.name}
          </h3>
          {mentor.title && (
            <p className="text-sm text-muted-foreground mt-0.5 truncate">
              {mentor.title}
            </p>
          )}
          {mentor.company && (
            <div className="flex items-center justify-center gap-1 mt-1">
              <Building2 className="h-3 w-3 text-muted-foreground/70 shrink-0" />
              <span className="text-xs text-muted-foreground truncate">
                {mentor.company}
              </span>
            </div>
          )}
        </div>

        {/* Expertise tags */}
        {mentor.tags.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5">
            {mentor.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="rounded-full text-xs px-2.5 py-0.5 font-normal"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Stars + reviews */}
        <div className="flex items-center justify-between border-t border-border pt-3 gap-2">
          <div className="flex items-center gap-1.5 shrink-0">
            <StarRating rating={mentor.rating} />
            <span className="text-sm font-semibold text-foreground">
              {mentor.rating.toFixed(1)}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {mentor.reviewCount} reviews
          </span>
        </div>

        {/* Completed sessions */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5 shrink-0" />
          <span>{mentor.completedSessions} completed sessions</span>
        </div>

        {/* CTA */}
        <Link href={`/profile/${mentor.id}`} className="mt-auto">
          <Button size="sm" className="w-full gap-1.5">
            View Profile
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
