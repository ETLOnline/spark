"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle2, FileText, Link2, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/src/components/ui/tabs"
import { FileUpload } from "@/src/components/ui/file-upload"
import { useServerAction } from "@/src/hooks/useServerAction"
import { useToast } from "@/src/hooks/use-toast"
import {
  DeleteMilestoneArtifactAction,
  SubmitMilestoneArtifactAction,
  UpdateMilestoneAction
} from "@/src/server-actions/Milestone/Milestone"
import {
  MilestoneArtifactEntry,
  MilestoneStatus,
  SelectProjectMilestone
} from "@/src/db/schema"
import { MILESTONE_ARTIFACT_ACCEPT } from "./constants"
import { MILESTONE_STATUS_TOAST } from "./constants"

// ─── Types ────────────────────────────────────────────────────────────────────

type ArtifactTab = "file" | "link"

export interface ArtifactManageDialogProps {
  open: boolean
  milestoneId: string
  artifacts: MilestoneArtifactEntry[]
  status: MilestoneStatus
  /** true = student view (can add, limited delete, "Mark as Done" button) */
  isStudent: boolean
  onClose: () => void
  onArtifactsChanged: (updated: MilestoneArtifactEntry[]) => void
  onMarkDone: () => void
  onMarkCompleted?: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ArtifactManageDialog({
  open,
  milestoneId,
  artifacts,
  status,
  isStudent,
  onClose,
  onArtifactsChanged,
  onMarkDone,
  onMarkCompleted
}: ArtifactManageDialogProps) {
  const { toast } = useToast()

  const [tab, setTab] = useState<ArtifactTab>("file")
  const [link, setLink] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [deletingIdx, setDeletingIdx] = useState<number | null>(null)
  const [isMarkingDone, setIsMarkingDone] = useState(false)
  const [isMarkingCompleted, setIsMarkingCompleted] = useState(false)

  const [, , , submitArtifact] = useServerAction(SubmitMilestoneArtifactAction)
  const [, , , deleteArtifact] = useServerAction(DeleteMilestoneArtifactAction)
  const [, , , updateMilestone] = useServerAction(UpdateMilestoneAction)

  // Students can add/replace artifacts until advisor marks as Completed
  const canEdit =
    isStudent &&
    status !== MilestoneStatus.COMPLETED &&
    status !== MilestoneStatus.INCOMPLETE

  // Students can delete until the milestone is fully Completed (advisor verified)
  // Advisors can also delete until Completed
  const canDelete = status !== MilestoneStatus.COMPLETED

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleClose = () => {
    setTab("file")
    setLink("")
    setSelectedFile(null)
    onClose()
  }

  const handleAdd = async () => {
    if (tab === "link") {
      if (!link.trim()) {
        toast({ title: "Please enter a URL", variant: "destructive" })
        return
      }
      try {
        new URL(link.trim())
      } catch {
        toast({ title: "Please enter a valid URL", variant: "destructive" })
        return
      }
      setIsAdding(true)
      try {
        const res = await submitArtifact(milestoneId, { link: link.trim() })
        if (res?.success && res.data) {
          onArtifactsChanged(
            (res.data as SelectProjectMilestone)
              .artifacts as MilestoneArtifactEntry[]
          )
          setTab("file")
          setLink("")
          toast({ title: "Link added" })
        } else {
          toast({
            title:
              (res as { message?: string })?.message ?? "Failed to add link",
            variant: "destructive"
          })
        }
      } catch {
        toast({ title: "Failed to add link", variant: "destructive" })
      } finally {
        setIsAdding(false)
      }
    } else {
      if (!selectedFile) {
        toast({ title: "Please select a file", variant: "destructive" })
        return
      }
      setIsAdding(true)
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve((reader.result as string).split(",")[1])
          reader.onerror = reject
          reader.readAsDataURL(selectedFile)
        })
        const res = await submitArtifact(milestoneId, {
          file: {
            name: selectedFile.name,
            sizeBytes: selectedFile.size,
            base64,
            mimeType: selectedFile.type
          }
        })
        if (res?.success && res.data) {
          onArtifactsChanged(
            (res.data as SelectProjectMilestone)
              .artifacts as MilestoneArtifactEntry[]
          )
          setTab("file")
          setSelectedFile(null)
          toast({ title: "File uploaded" })
        } else {
          toast({
            title:
              (res as { message?: string })?.message ?? "Failed to upload file",
            variant: "destructive"
          })
        }
      } catch {
        toast({ title: "Failed to upload file", variant: "destructive" })
      } finally {
        setIsAdding(false)
      }
    }
  }

  const handleDelete = async (index: number) => {
    setDeletingIdx(index)
    try {
      const res = await deleteArtifact(milestoneId, index)
      if (res?.success && res.data) {
        onArtifactsChanged(
          (res.data as SelectProjectMilestone)
            .artifacts as MilestoneArtifactEntry[]
        )
        toast({ title: "Artifact removed" })
      } else {
        toast({
          title: (res as { message?: string })?.message ?? "Failed to remove",
          variant: "destructive"
        })
      }
    } catch {
      toast({ title: "Failed to remove artifact", variant: "destructive" })
    } finally {
      setDeletingIdx(null)
    }
  }

  const handleMarkDone = async () => {
    if (artifacts.length === 0) {
      toast({
        title: "Add at least one artifact before marking as Done",
        variant: "destructive"
      })
      return
    }
    setIsMarkingDone(true)
    try {
      const res = await updateMilestone(milestoneId, {
        status: MilestoneStatus.DONE_PENDING_VERIFICATION
      })
      if (res?.success) {
        toast({
          title:
            MILESTONE_STATUS_TOAST[MilestoneStatus.DONE_PENDING_VERIFICATION]
        })
        onMarkDone()
        handleClose()
      } else {
        toast({
          title:
            (res as { message?: string })?.message ?? "Failed to update status",
          variant: "destructive"
        })
      }
    } catch {
      toast({ title: "Failed to update status", variant: "destructive" })
    } finally {
      setIsMarkingDone(false)
    }
  }

  const handleMarkCompleted = async () => {
    setIsMarkingCompleted(true)
    try {
      const res = await updateMilestone(milestoneId, {
        status: MilestoneStatus.COMPLETED
      })
      if (res?.success) {
        toast({ title: MILESTONE_STATUS_TOAST[MilestoneStatus.COMPLETED] })
        onMarkCompleted?.()
        handleClose()
      } else {
        toast({
          title:
            (res as { message?: string })?.message ?? "Failed to update status",
          variant: "destructive"
        })
      }
    } catch {
      toast({ title: "Failed to update status", variant: "destructive" })
    } finally {
      setIsMarkingCompleted(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Proof of Completion</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          {/* Artifact list */}
          {artifacts.length > 0 ? (
            <div className="space-y-2">
              {artifacts.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                >
                  {a.type === "file" ? (
                    <>
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <Link
                        href={a.file_path}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 truncate text-primary hover:underline"
                      >
                        {a.file_name}
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <Link
                        href={a.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 truncate text-primary hover:underline"
                      >
                        {a.url}
                      </Link>
                    </>
                  )}
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive cursor-pointer"
                      disabled={deletingIdx === i}
                      onClick={() => handleDelete(i)}
                    >
                      {deletingIdx === i ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-3">
              {isStudent
                ? "No artifacts yet. Add at least one before marking as Done."
                : "No artifacts have been submitted for this milestone."}
            </p>
          )}

          {/* Upload section — students only, while milestone is editable */}
          {canEdit && (
            <div className="border-t pt-3">
              <Tabs
                value={tab}
                onValueChange={(v) => {
                  setTab(v as ArtifactTab)
                  setSelectedFile(null)
                  setLink("")
                }}
              >
                <TabsList>
                  <TabsTrigger value="file">Upload file</TabsTrigger>
                  <TabsTrigger value="link">Paste link</TabsTrigger>
                </TabsList>

                <TabsContent value="file" className="space-y-2">
                  <FileUpload
                    fileType="file"
                    accept={MILESTONE_ARTIFACT_ACCEPT}
                    multiple={false}
                    onChange={(files) => setSelectedFile(files[0] ?? null)}
                    onRemove={() => setSelectedFile(null)}
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    PDF, DOC, DOCX, or image (PNG, JPG, GIF, WebP). Max 200MB.
                  </p>
                  <Button
                    size="sm"
                    onClick={handleAdd}
                    disabled={isAdding || !selectedFile}
                    className="w-full cursor-pointer"
                  >
                    {isAdding ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    ) : null}
                    Upload
                  </Button>
                </TabsContent>

                <TabsContent value="link" className="space-y-2">
                  <Input
                    placeholder="https://github.com/..."
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={handleAdd}
                    disabled={isAdding || !link.trim()}
                    className="w-full cursor-pointer"
                  >
                    {isAdding ? (
                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    ) : null}
                    Add Link
                  </Button>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isMarkingDone || isMarkingCompleted}
          >
            Close
          </Button>

          {/* Student: Mark as Done */}
          {isStudent && status === MilestoneStatus.IN_PROGRESS && (
            <Button
              onClick={handleMarkDone}
              disabled={artifacts.length === 0 || isMarkingDone}
              className="min-w-32 cursor-pointer"
            >
              {isMarkingDone ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Mark as Done
            </Button>
          )}

          {/* Advisor / Admin: Mark as Completed */}
          {!isStudent &&
            status === MilestoneStatus.DONE_PENDING_VERIFICATION && (
              <Button
                onClick={handleMarkCompleted}
                disabled={isMarkingCompleted}
                className="min-w-36 cursor-pointer"
              >
                {isMarkingCompleted ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Mark as Completed
              </Button>
            )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
