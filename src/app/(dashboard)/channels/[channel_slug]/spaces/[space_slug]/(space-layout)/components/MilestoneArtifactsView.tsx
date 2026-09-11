"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAtomValue } from "jotai"
import moment from "moment"
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  PlusCircle,
  RotateCcw
} from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Badge } from "@/src/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
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
import { usePermissionChecker } from "@/src/hooks/usePermissionChecker"
import { spaceStore } from "@/src/store/space/spaceStore"
import {
  GetMilestoneByIdAction,
  DeleteMilestoneArtifactAction,
  SubmitMilestoneArtifactAction,
  UpdateMilestoneAction,
  RevertMilestoneAction
} from "@/src/server-actions/Milestone/Milestone"
import { SelectFypMilestone } from "@/src/db/schema"
import {
  MilestoneArtifactEntry,
  MilestoneStatus
} from "@/src/types/Milestone/Milestone"
import {
  MILESTONE_ARTIFACT_ACCEPT,
  MILESTONE_DATE_FORMAT,
  MILESTONE_STATUS_TOAST
} from "./constants"
import { ArtifactFeed } from "./ArtifactFeed"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    [MilestoneStatus.VERIFIED]: {
      label: "Verified",
      className: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20"
    },
    [MilestoneStatus.COMPLETED_PENDING_VERIFICATION]: {
      label: "Pending Verification",
      className: "bg-amber-500/10 text-amber-600 border-amber-500/20"
    },
    [MilestoneStatus.IN_PROGRESS]: {
      label: "In Progress",
      className: "bg-blue-500/10 text-blue-600 border-blue-500/20"
    },
    [MilestoneStatus.INCOMPLETE]: {
      label: "Incomplete",
      className: "bg-muted/60 text-muted-foreground border-muted-foreground/20"
    }
  }
  const { label, className } = map[status] ?? map[MilestoneStatus.INCOMPLETE]
  return (
    <Badge variant="outline" className={`text-xs font-medium ${className}`}>
      {label}
    </Badge>
  )
}

// ─── Add Artifact Dialog ──────────────────────────────────────────────────────

function AddArtifactDialog({
  open,
  milestoneId,
  onClose,
  onAdded
}: {
  open: boolean
  milestoneId: string
  onClose: () => void
  onAdded: (updated: MilestoneArtifactEntry[]) => void
}) {
  const { toast } = useToast()
  const [tab, setTab] = useState<"file" | "link">("file")
  const [link, setLink] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  const [, , , submitArtifact] = useServerAction(SubmitMilestoneArtifactAction)

  const reset = () => {
    setTab("file")
    setLink("")
    setSelectedFile(null)
  }

  const handleClose = () => {
    reset()
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
          onAdded(
            (res.data as SelectFypMilestone)
              .artifacts as MilestoneArtifactEntry[]
          )
          toast({ title: "Link added" })
          handleClose()
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
          onAdded(
            (res.data as SelectFypMilestone)
              .artifacts as MilestoneArtifactEntry[]
          )
          toast({ title: "File uploaded" })
          handleClose()
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

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Artifact</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <Tabs
            value={tab}
            onValueChange={(v) => {
              setTab(v as "file" | "link")
              setSelectedFile(null)
              setLink("")
            }}
          >
            <TabsList className="w-full">
              <TabsTrigger value="file" className="flex-1">
                Upload file
              </TabsTrigger>
              <TabsTrigger value="link" className="flex-1">
                Paste link
              </TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="space-y-3 pt-2">
              <FileUpload
                fileType="file"
                accept={MILESTONE_ARTIFACT_ACCEPT}
                multiple={false}
                onChange={(files) => setSelectedFile(files[0] ?? null)}
                onRemove={() => setSelectedFile(null)}
              />
              <p className="text-xs text-muted-foreground text-center">
                PDF, DOC, DOCX, or image (PNG, JPG, GIF, WebP). Max 200 MB.
              </p>
              <Button
                onClick={handleAdd}
                disabled={isAdding || !selectedFile}
                className="w-full cursor-pointer"
              >
                {isAdding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Upload
              </Button>
            </TabsContent>

            <TabsContent value="link" className="space-y-3 pt-2">
              <Input
                placeholder="https://github.com/..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd()
                }}
                autoFocus
              />
              <Button
                onClick={handleAdd}
                disabled={isAdding || !link.trim()}
                className="w-full cursor-pointer"
              >
                {isAdding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add Link
              </Button>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isAdding}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main view ────────────────────────────────────────────────────────────────

export default function MilestoneArtifactsView({
  milestoneId,
  channelSlug,
  spaceSlug
}: {
  milestoneId: string
  channelSlug: string
  spaceSlug: string
}) {
  const router = useRouter()
  const { toast } = useToast()

  const [milestone, setMilestone] = useState<SelectFypMilestone | null>(null)
  const [loading, setLoading] = useState(true)
  const [deletingIdx, setDeletingIdx] = useState<number | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)

  const [, , , getMilestone] = useServerAction(GetMilestoneByIdAction)
  const [, , , deleteArtifact] = useServerAction(DeleteMilestoneArtifactAction)
  const [, , , updateMilestone] = useServerAction(UpdateMilestoneAction)
  const [, , , revertMilestone] = useServerAction(RevertMilestoneAction)

  // ── Permissions (same logic as FYPMilestones) ──
  const currentSpace = useAtomValue(spaceStore.currentSpace)
  const communityId = currentSpace?.channel?.community_id ?? undefined
  const spaceId = currentSpace?.id

  const { permissionChecker: globalChecker } = usePermissionChecker("global")
  const { permissionChecker: scopedChecker } = usePermissionChecker(
    "scoped",
    "COMMUNITY",
    communityId
  )
  const { permissionChecker: spaceChecker } = usePermissionChecker(
    "scoped",
    "SPACE",
    spaceId
  )

  const canFyp = (action: string): boolean => {
    const isAdvisor = globalChecker?.canAccess(action) ?? false
    const isCommunityAdmin = scopedChecker?.canAccess(action) ?? false
    if (isAdvisor) return spaceChecker?.canAccess("space.update") ?? false
    return isCommunityAdmin
  }

  const canManage =
    canFyp("fyp.milestone.create") ||
    canFyp("fyp.milestone.update") ||
    canFyp("fyp.milestone.delete") ||
    canFyp("fyp.milestone.verify") ||
    canFyp("fyp.milestone.revert")

  const canVerify = canFyp("fyp.milestone.verify")
  const canRevert = canFyp("fyp.milestone.revert")

  const isStudent = !canManage
  const status = (milestone?.status ??
    MilestoneStatus.INCOMPLETE) as MilestoneStatus
  const artifacts = (milestone?.artifacts as MilestoneArtifactEntry[]) ?? []

  const canEdit =
    isStudent &&
    status !== MilestoneStatus.VERIFIED &&
    status !== MilestoneStatus.INCOMPLETE

  const canDelete = status !== MilestoneStatus.VERIFIED

  const backUrl = `/channels/${channelSlug}/spaces/${spaceSlug}?page-type=fyp&fyp-tab=milestones`

  // ── Fetch ──
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getMilestone(milestoneId)
      if (res?.success && res.data) {
        setMilestone(res.data as SelectFypMilestone)
      } else {
        toast({ title: "Milestone not found", variant: "destructive" })
        router.push(backUrl)
      }
    } catch {
      toast({ title: "Failed to load milestone", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [milestoneId])

  useEffect(() => {
    load()
  }, [load])

  const formatDate = (d: string | null | undefined) =>
    d && moment(d).isValid() ? moment(d).format(MILESTONE_DATE_FORMAT) : "—"

  // ── Handlers ──
  const handleDelete = async (index: number) => {
    setDeletingIdx(index)
    try {
      const res = await deleteArtifact(milestoneId, index)
      if (res?.success && res.data) {
        const updated = res.data as SelectFypMilestone
        setMilestone(updated)
        const statusReverted = updated.status !== status
        toast({
          title: statusReverted
            ? "Artifact removed — milestone reverted to In Progress"
            : "Artifact removed"
        })
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
    setActionLoading(true)
    try {
      const res = await updateMilestone(milestoneId, {
        status: MilestoneStatus.COMPLETED_PENDING_VERIFICATION
      })
      if (res?.success) {
        toast({
          title:
            MILESTONE_STATUS_TOAST[
              MilestoneStatus.COMPLETED_PENDING_VERIFICATION
            ]
        })
        router.push(backUrl)
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
      setActionLoading(false)
    }
  }

  const handleVerify = async () => {
    setActionLoading(true)
    try {
      const res = await updateMilestone(milestoneId, {
        status: MilestoneStatus.VERIFIED
      })
      if (res?.success) {
        toast({ title: MILESTONE_STATUS_TOAST[MilestoneStatus.VERIFIED] })
        router.push(backUrl)
      } else {
        toast({
          title: (res as { message?: string })?.message ?? "Failed to verify",
          variant: "destructive"
        })
      }
    } catch {
      toast({ title: "Failed to verify", variant: "destructive" })
    } finally {
      setActionLoading(false)
    }
  }

  const handleRevert = async () => {
    setActionLoading(true)
    try {
      const res = await revertMilestone(milestoneId)
      if (res?.success && res.data) {
        setMilestone(res.data as SelectFypMilestone)
        toast({ title: "Milestone status reverted." })
      } else {
        toast({
          title: (res as { message?: string })?.message ?? "Failed to revert",
          variant: "destructive"
        })
      }
    } catch {
      toast({ title: "Failed to revert", variant: "destructive" })
    } finally {
      setActionLoading(false)
    }
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader size={LoaderSizes.xl} />
      </div>
    )
  }

  if (!milestone) return null

  const showActionBar =
    (isStudent && status === MilestoneStatus.IN_PROGRESS) ||
    (canVerify && status === MilestoneStatus.COMPLETED_PENDING_VERIFICATION) ||
    (canRevert &&
      (status === MilestoneStatus.IN_PROGRESS ||
        status === MilestoneStatus.COMPLETED_PENDING_VERIFICATION ||
        status === MilestoneStatus.VERIFIED))

  return (
    <div className="h-full flex flex-col">
      {/* ── Top header bar ── */}
      <div className="flex items-center gap-3 px-6 py-4 border-b bg-card/50">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-pointer shrink-0"
          onClick={() => router.push(backUrl)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-semibold leading-tight truncate">
            {milestone.name}
          </h1>
          <p className="text-xs text-muted-foreground">Proof of Completion</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {canEdit && (
            <Button
              size="sm"
              className="cursor-pointer"
              onClick={() => setShowAddDialog(true)}
            >
              <PlusCircle className="h-4 w-4 mr-1.5" />
              Add Artifact
            </Button>
          )}
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left: artifact feed */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {artifacts.length > 0 ? (
            <ArtifactFeed
              artifacts={artifacts}
              canDelete={canDelete}
              deletingIdx={deletingIdx}
              onDelete={handleDelete}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] rounded-xl border border-dashed bg-muted/20 space-y-2 text-center p-8">
              <p className="text-sm font-medium text-muted-foreground">
                No artifacts yet
              </p>
              <p className="text-xs text-muted-foreground/60">
                {isStudent
                  ? "Upload a file or paste a link to submit your work."
                  : "No artifacts have been submitted for this milestone."}
              </p>
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 cursor-pointer"
                  onClick={() => setShowAddDialog(true)}
                >
                  <PlusCircle className="h-4 w-4 mr-1.5" />
                  Add First Artifact
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Right: sidebar panel */}
        <div className="w-72 shrink-0 border-l bg-card/30 flex flex-col overflow-y-auto">
          {/* Artifact count */}
          <div className="px-5 py-4 border-b">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              Artifacts
            </p>
            <p className="text-2xl font-bold">{artifacts.length}</p>
            <p className="text-xs text-muted-foreground">
              {artifacts.filter((a) => a.type === "file").length} file
              {artifacts.filter((a) => a.type === "file").length !== 1
                ? "s"
                : ""}
              , {artifacts.filter((a) => a.type === "link").length} link
              {artifacts.filter((a) => a.type === "link").length !== 1
                ? "s"
                : ""}
            </p>
          </div>

          {/* Status */}
          <div className="px-5 py-4 border-b space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Status
            </p>
            <StatusBadge status={status} />
          </div>

          {/* Dates */}
          <div className="px-5 py-4 border-b space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Timeline
            </p>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-muted-foreground">Start</p>
                <p className="text-sm font-medium">
                  {formatDate(milestone.start_date)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">End</p>
                <p className="text-sm font-medium">
                  {formatDate(milestone.end_date)}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {showActionBar && (
            <div className="px-5 py-4 space-y-2 mt-auto border-t">
              {isStudent && status === MilestoneStatus.IN_PROGRESS && (
                <Button
                  onClick={handleMarkDone}
                  disabled={artifacts.length === 0 || actionLoading}
                  className="w-full cursor-pointer"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Clock className="h-4 w-4 mr-2" />
                  )}
                  Complete (Pending Verification)
                </Button>
              )}

              {canVerify &&
                status === MilestoneStatus.COMPLETED_PENDING_VERIFICATION && (
                  <Button
                    onClick={handleVerify}
                    disabled={actionLoading}
                    className="w-full cursor-pointer"
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                    )}
                    Verify Milestone
                  </Button>
                )}

              {canRevert &&
                (status === MilestoneStatus.IN_PROGRESS ||
                  status === MilestoneStatus.COMPLETED_PENDING_VERIFICATION ||
                  status === MilestoneStatus.VERIFIED) && (
                  <Button
                    variant="outline"
                    onClick={handleRevert}
                    disabled={actionLoading}
                    className="w-full text-amber-600 border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-600 cursor-pointer"
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RotateCcw className="h-4 w-4 mr-2" />
                    )}
                    Revert Status
                  </Button>
                )}
            </div>
          )}
        </div>
      </div>

      {/* ── Add artifact dialog ── */}
      <AddArtifactDialog
        open={showAddDialog}
        milestoneId={milestoneId}
        onClose={() => setShowAddDialog(false)}
        onAdded={(updated) => {
          setMilestone((prev) =>
            prev ? { ...prev, artifacts: updated } : prev
          )
          setShowAddDialog(false)
        }}
      />
    </div>
  )
}
