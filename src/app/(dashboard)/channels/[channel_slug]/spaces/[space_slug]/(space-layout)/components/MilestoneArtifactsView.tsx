"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/src/components/ui/alert-dialog"
import { useServerAction } from "@/src/hooks/useServerAction"
import { useToast } from "@/src/hooks/use-toast"
import { useMilestonePermissions } from "@/src/hooks/useMilestonePermissions"
import {
  GetMilestoneByIdAction,
  DeleteMilestoneArtifactAction,
  UpdateMilestoneAction,
  RevertMilestoneAction
} from "@/src/server-actions/Milestone/Milestone"
import type { MilestoneWithArtifacts } from "@/src/server-actions/Milestone/Milestone"
import {
  MilestoneStatus,
  MilestoneArtifactEntry
} from "@/src/types/Milestone/Milestone"
import {
  MILESTONE_DATE_FORMAT,
  MILESTONE_STATUS_TOAST
} from "./constants"
import { ArtifactFeed } from "./ArtifactFeed"
import { MilestoneStatusBadge } from "./MilestoneStatusBadge"
import { AddArtifactDialog } from "./AddArtifactDialog"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import pusherClient from "@/src/services/realtime/PusherClient"

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

  const [milestone, setMilestone] = useState<MilestoneWithArtifacts | null>(null)
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [confirmMarkDone, setConfirmMarkDone] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)

  const [, , , getMilestone] = useServerAction(GetMilestoneByIdAction)
  const [, , , deleteArtifact] = useServerAction(DeleteMilestoneArtifactAction)
  const [, , , updateMilestone] = useServerAction(UpdateMilestoneAction)
  const [, , , revertMilestone] = useServerAction(RevertMilestoneAction)

  // ── Permissions ──
  const {
    canVerifyMilestone: canVerify,
    canRevertMilestone: canRevert,
    canArtifactAdd,
    canArtifactDelete
  } = useMilestonePermissions()

  const status = (milestone?.status ??
    MilestoneStatus.INCOMPLETE) as MilestoneStatus
  const artifacts = milestone?.artifacts ?? []

  const canEdit =
    canArtifactAdd &&
    status !== MilestoneStatus.VERIFIED &&
    status !== MilestoneStatus.INCOMPLETE

  const canDelete = canArtifactDelete && status !== MilestoneStatus.VERIFIED

  const backUrl = `/channels/${channelSlug}/spaces/${spaceSlug}?page-type=fyp&fyp-tab=milestones`

  // ── Fetch ──
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getMilestone(milestoneId)
      if (res?.success && res.data) {
        setMilestone(res.data as MilestoneWithArtifacts)
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

  // Real-time: subscribe to the per-milestone Pusher channel so status and
  // artifact changes made by other users (advisor verifying, student adding
  // an artifact from a different session, etc.) are reflected immediately.
  useEffect(() => {
    const channelName = `milestone-${milestoneId}`
    const channel = pusherClient.subscribe(channelName)

    channel.bind(
      "status-update",
      (data: { id: string; status: MilestoneStatus }) => {
        setMilestone((prev) =>
          prev && prev.id === data.id ? { ...prev, status: data.status } : prev
        )
      }
    )

    channel.bind(
      "artifacts-update",
      (data: { id: string; artifacts: MilestoneArtifactEntry[] }) => {
        setMilestone((prev) =>
          prev && prev.id === data.id
            ? { ...prev, artifacts: data.artifacts }
            : prev
        )
      }
    )

    return () => {
      const ch = pusherClient.channel(channelName)
      if (ch) {
        ch.unbind_all()
        pusherClient.unsubscribe(channelName)
      }
    }
  }, [milestoneId])

  const formatDate = (d: string | null | undefined) =>
    d && moment(d).isValid() ? moment(d).format(MILESTONE_DATE_FORMAT) : "—"

  // ── Handlers ──
  const handleDelete = async (artifactId: number) => {
    setDeletingId(artifactId)
    try {
      const res = await deleteArtifact(milestoneId, artifactId)
      if (res?.success && res.data) {
        const updated = res.data as MilestoneWithArtifacts
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
      setDeletingId(null)
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
        setMilestone(res.data as MilestoneWithArtifacts)
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
    (canArtifactAdd && status === MilestoneStatus.IN_PROGRESS) ||
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
              deletingId={deletingId}
              onDelete={setConfirmDeleteId}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] rounded-xl border border-dashed bg-muted/20 space-y-2 text-center p-8">
              <p className="text-sm font-medium text-muted-foreground">
                No artifacts yet
              </p>
              <p className="text-xs text-muted-foreground/60">
                {canArtifactAdd
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
            <MilestoneStatusBadge status={status} />
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
              {canArtifactAdd && status === MilestoneStatus.IN_PROGRESS && (
                <Button
                  onClick={() => setConfirmMarkDone(true)}
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

      {/* ── Confirm delete artifact ── */}
      <AlertDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmDeleteId(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this artifact?</AlertDialogTitle>
            <AlertDialogDescription>
              This can&apos;t be undone. The file or link will be permanently
              removed from this milestone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDeleteId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (confirmDeleteId !== null) handleDelete(confirmDeleteId)
                setConfirmDeleteId(null)
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── Confirm mark as done ── */}
      <AlertDialog open={confirmMarkDone} onOpenChange={setConfirmMarkDone}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark milestone as done?</AlertDialogTitle>
            <AlertDialogDescription>
              This submits your artifacts for verification. You won&apos;t be
              able to add or remove artifacts until it&apos;s reverted back to
              In Progress.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmMarkDone(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmMarkDone(false)
                handleMarkDone()
              }}
            >
              Mark as Done
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
