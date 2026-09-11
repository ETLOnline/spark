"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ExternalLink,
  FileText,
  ImageIcon,
  Link2,
  Loader2,
  Trash2
} from "lucide-react"
import ImageLightbox from "@/src/components/common/LightBox"
import { Button } from "@/src/components/ui/button"
import { MilestoneArtifactEntry } from "@/src/types/Milestone/Milestone"

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ArtifactFeedProps {
  artifacts: MilestoneArtifactEntry[]
  canDelete?: boolean
  deletingIdx?: number | null
  onDelete?: (index: number) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ArtifactFeed({
  artifacts,
  canDelete = false,
  deletingIdx = null,
  onDelete
}: ArtifactFeedProps) {
  const [lightboxFileId, setLightboxFileId] = useState<number | null>(null)

  const imageArtifacts = artifacts.filter(
    (a): a is Extract<MilestoneArtifactEntry, { type: "file" }> =>
      a.type === "file" && (a.mime_type?.startsWith("image/") ?? false)
  )
  const imageUrls = imageArtifacts.map((a) => a.file_path)
  const lightboxIndex = imageArtifacts.findIndex(
    (a) => a.file_id === lightboxFileId
  )

  return (
    <>
      <div className="relative">
        {/* Vertical connecting line — only when 2+ artifacts */}
        {artifacts.length > 1 && (
          <div className="absolute left-[15px] top-5 bottom-5 w-px bg-border" />
        )}

        <div className="space-y-3">
          {artifacts.map((a, i) => {
            const isDeleting = deletingIdx === i
            const isImg =
              a.type === "file" && (a.mime_type?.startsWith("image/") ?? false)

            // ── Timeline dot ──
            const dotIcon =
              a.type === "link" ? (
                <Link2 className="h-3.5 w-3.5" />
              ) : isImg ? (
                <ImageIcon className="h-3.5 w-3.5" />
              ) : (
                <FileText className="h-3.5 w-3.5" />
              )

            const dotColor =
              a.type === "link"
                ? "border-primary/40 bg-primary/10 text-primary"
                : isImg
                  ? "border-purple-400/40 bg-purple-500/10 text-purple-500"
                  : "border-blue-400/40 bg-blue-500/10 text-blue-500"

            // ── Shared delete button ──
            const deleteBtn = canDelete && onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive cursor-pointer"
                disabled={isDeleting}
                onClick={() => onDelete(i)}
              >
                {isDeleting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </Button>
            )

            return (
              <div key={i} className="relative flex gap-3 items-start">
                {/* Dot */}
                <div
                  className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${dotColor}`}
                >
                  {dotIcon}
                </div>

                {/* Post card */}
                <div className="flex-1 min-w-0 rounded-xl border bg-card overflow-hidden">
                  {isImg && a.type === "file" ? (
                    // ── Image post: show the image ──
                    <>
                      <div
                        className="group relative cursor-pointer aspect-video overflow-hidden"
                        onClick={() => setLightboxFileId(a.file_id)}
                      >
                        <Image
                          src={a.file_path}
                          alt={a.file_name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />
                        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                      </div>
                      <div className="flex items-center gap-2 px-3 py-2">
                        <span className="flex-1 truncate text-xs text-muted-foreground">
                          {a.file_name}
                        </span>
                        <Link
                          href={a.file_path}
                          target="_blank"
                          rel="noreferrer"
                          className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                        {deleteBtn}
                      </div>
                    </>
                  ) : a.type === "file" ? (
                    // ── Non-image file post ──
                    <div className="flex items-center gap-3 px-3 py-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">
                          {a.file_name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          File attachment
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Link
                          href={a.file_path}
                          target="_blank"
                          rel="noreferrer"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                        {deleteBtn}
                      </div>
                    </div>
                  ) : (
                    // ── Link post ──
                    <div className="flex items-center gap-3 px-3 py-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Link2 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={a.url}
                          target="_blank"
                          rel="noreferrer"
                          className="block truncate text-sm font-medium text-primary hover:underline"
                        >
                          {a.url}
                        </Link>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          External link
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <Link
                          href={a.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                        {deleteBtn}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Lightbox for images */}
      <ImageLightbox
        open={lightboxFileId !== null}
        images={imageUrls}
        index={lightboxIndex >= 0 ? lightboxIndex : 0}
        onClose={() => setLightboxFileId(null)}
        showDownload={true}
      />
    </>
  )
}
