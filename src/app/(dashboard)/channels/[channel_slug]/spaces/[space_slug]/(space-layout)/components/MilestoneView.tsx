"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import moment from "moment"
import {
  Check,
  CheckCircle2,
  Circle,
  CircleDashed,
  Clock,
  Info,
  Loader2,
  MoreVertical,
  Pencil,
  RotateCcw,
  Trash2,
  X
} from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu"
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/src/components/ui/popover"
import { useServerAction } from "@/src/hooks/useServerAction"
import {
  UpdateMilestoneAction,
  DeleteMilestoneAction,
  RevertMilestoneAction
} from "@/src/server-actions/Milestone/Milestone"
import type { MilestoneWithArtifacts } from "@/src/server-actions/Milestone/Milestone"
import {
  MilestoneStatus,
  MilestoneArtifactEntry
} from "@/src/types/Milestone/Milestone"
import { useToast } from "@/src/hooks/use-toast"
import pusherClient from "@/src/services/realtime/PusherClient"
import { MILESTONE_STATUS_TOAST, MILESTONE_DATE_FORMAT } from "./constants"
import { MilestoneStepper } from "./MilestoneStepper"
import { StatusIcon } from "./StatusIcon"
import { MilestoneStatusBadge } from "./MilestoneStatusBadge"

export function MilestoneView({
  milestones: initial,
  canManage,
  canArtifactAdd,
  canCreateMilestone,
  canUpdateMilestone,
  canDeleteMilestone,
  canVerifyMilestone,
  canRevertMilestone,
  onSetupAgain,
  onMilestoneDeleted
}: {
  milestones: MilestoneWithArtifacts[]
  canManage: boolean
  canArtifactAdd: boolean
  canCreateMilestone: boolean
  canUpdateMilestone: boolean
  canDeleteMilestone: boolean
  canVerifyMilestone: boolean
  canRevertMilestone: boolean
  onSetupAgain: () => void
  onMilestoneDeleted?: (id: string) => void
}) {
  const { toast } = useToast()
  const router = useRouter()
  const params = useParams()
  const channelSlug = params.channel_slug as string
  const spaceSlug = params.space_slug as string

  const [milestones, setMilestones] = useState(initial)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string
    name: string
  } | null>(null)

  // Real-time: subscribe to a private per-milestone channel for each milestone.
  // Follows the same pattern as private-chat-${chatId} used in ChatScreen.
  useEffect(() => {
    if (!initial.length) return

    const subscriptions = initial.map((m) => {
      const channelName = `milestone-${m.id}`
      const channel = pusherClient.subscribe(channelName)

      channel.bind(
        "status-update",
        (data: { id: string; status: MilestoneStatus }) => {
          setMilestones((prev) =>
            prev.map((ms) =>
              ms.id === data.id ? { ...ms, status: data.status } : ms
            )
          )
        }
      )

      channel.bind(
        "artifacts-update",
        (data: { id: string; artifacts: MilestoneArtifactEntry[] }) => {
          setMilestones((prev) =>
            prev.map((ms) =>
              ms.id === data.id ? { ...ms, artifacts: data.artifacts } : ms
            )
          )
        }
      )

      return channelName
    })

    return () => {
      subscriptions.forEach((channelName) => {
        const ch = pusherClient.channel(channelName)
        if (ch) {
          ch.unbind_all()
          pusherClient.unsubscribe(channelName)
        }
      })
    }
  }, [])

  const [, , , updateMilestone] = useServerAction(UpdateMilestoneAction)
  const [, , , deleteMilestone] = useServerAction(DeleteMilestoneAction)
  const [, , , revertMilestone] = useServerAction(RevertMilestoneAction)

  const handleStatusChange = async (id: string, status: MilestoneStatus) => {
    setActionLoading(id)
    try {
      const res = await updateMilestone(id, { status })
      if (res?.success) {
        setMilestones((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status } : m))
        )
        toast({ title: MILESTONE_STATUS_TOAST[status] ?? "Status updated." })
      } else {
        toast({ title: "Failed to update status", variant: "destructive" })
      }
    } catch {
      toast({ title: "Failed to update status", variant: "destructive" })
    } finally {
      setActionLoading(null)
    }
  }

  const handleStartEdit = (m: MilestoneWithArtifacts) => {
    setEditingId(m.id)
    setEditName(m.name)
  }

  const handleSaveName = async (id: string) => {
    if (!editName.trim()) return
    try {
      const res = await updateMilestone(id, { name: editName.trim() })
      if (res?.success) {
        setMilestones((prev) =>
          prev.map((m) => (m.id === id ? { ...m, name: editName.trim() } : m))
        )
      } else {
        toast({ title: "Failed to update name", variant: "destructive" })
      }
    } catch {
      toast({ title: "Failed to update name", variant: "destructive" })
    } finally {
      setEditingId(null)
    }
  }

  const handleDeleteClick = (m: MilestoneWithArtifacts) => {
    const arts = m.artifacts
    const needsConfirm =
      m.status === MilestoneStatus.IN_PROGRESS || arts.length > 0
    if (needsConfirm) {
      setConfirmDelete({ id: m.id, name: m.name })
    } else {
      doDelete(m.id)
    }
  }

  const doDelete = async (id: string) => {
    try {
      const res = await deleteMilestone(id)
      if (res?.success) {
        const remaining = milestones.filter((m) => m.id !== id)
        setMilestones(remaining)
        toast({ title: "Milestone deleted" })
        onMilestoneDeleted?.(id)
        if (remaining.length === 0 && canManage) {
          onSetupAgain()
        }
      } else {
        toast({ title: "Failed to delete", variant: "destructive" })
      }
    } catch {
      toast({ title: "Failed to delete", variant: "destructive" })
    }
  }

  const handleRevert = async (id: string, currentStatus: string) => {
    setActionLoading(id)
    try {
      const res = await revertMilestone(id)
      if (res?.success && res.data) {
        const reverted = res.data as MilestoneWithArtifacts
        setMilestones((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status: reverted.status } : m))
        )
        toast({ title: "Milestone status reverted." })
      } else {
        toast({
          title: (res as { message?: string })?.message ?? "Failed to revert",
          variant: "destructive"
        })
      }
    } catch {
      toast({ title: "Failed to revert milestone", variant: "destructive" })
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (d: string | null | undefined) =>
    d && moment(d).isValid() ? moment(d).format(MILESTONE_DATE_FORMAT) : "—"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Project Milestones</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Track progress across each phase of the FYP.
          </p>
        </div>
        {canCreateMilestone && (
          <Button size="sm" variant="outline" onClick={onSetupAgain}>
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Reconfigure
          </Button>
        )}
      </div>

      <MilestoneStepper milestones={milestones} />

      {!canManage &&
        milestones.some((m) => m.status === MilestoneStatus.VERIFIED) && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-600 dark:text-amber-400 -mt-3">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <p>
              Verified milestones are locked. To remove or replace an artifact,
              contact your <span className="font-semibold">Advisor</span> or{" "}
              <span className="font-semibold">University Admin</span>.
            </p>
          </div>
        )}

      <div className="rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="py-2.5 px-4 text-left text-xs text-muted-foreground font-medium">
                Milestone Name
              </th>
              <th className="py-2.5 px-4 text-left text-xs text-muted-foreground font-medium">
                Status
              </th>
              <th className="py-2.5 px-4 text-left text-xs text-muted-foreground font-medium">
                Start Date
              </th>
              <th className="py-2.5 px-4 text-left text-xs text-muted-foreground font-medium">
                End Date
              </th>
              <th className="py-2.5 px-4 text-right text-xs text-muted-foreground font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {milestones.map((m) => {
              const isLoading = actionLoading === m.id

              return (
                <tr
                  key={m.id}
                  className="border-t hover:bg-muted/20 transition-colors"
                >
                  {/* Name */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <StatusIcon status={m.status} />
                      {editingId === m.id ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="h-7 text-sm w-40"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveName(m.id)
                              if (e.key === "Escape") setEditingId(null)
                            }}
                            autoFocus
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-emerald-500 hover:text-emerald-600 cursor-pointer"
                            onClick={() => handleSaveName(m.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground cursor-pointer"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-sm font-medium">{m.name}</span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-4">
                    <MilestoneStatusBadge status={m.status} />
                  </td>

                  {/* Start Date */}
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {formatDate(m.start_date)}
                  </td>

                  {/* End Date */}
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {formatDate(m.end_date)}
                  </td>

                  {/* Actions */}
                  {(() => {
                    const arts = m.artifacts
                    const canManageArtifact =
                      canArtifactAdd &&
                      !canManage &&
                      (m.status === MilestoneStatus.IN_PROGRESS ||
                        m.status ===
                          MilestoneStatus.COMPLETED_PENDING_VERIFICATION)
                    const canViewArtifact =
                      arts.length > 0 &&
                      ((!canArtifactAdd && !canManage) ||
                        (canArtifactAdd &&
                          !canManage &&
                          m.status === MilestoneStatus.VERIFIED) ||
                        canManage)

                    return (
                      <td className="py-3 px-2 align-middle relative">
                        <div className="flex items-center ">
                          {canManageArtifact && (
                            <Button
                              variant="outline"
                              className="h-6 w-[118px] text-xs justify-center border-primary/40 text-primary hover:bg-primary/10 hover:text-primary cursor-pointer"
                              onClick={() =>
                                router.push(
                                  `/channels/${channelSlug}/spaces/${spaceSlug}/milestones/${m.id}/artifacts`
                                )
                              }
                            >
                              Manage Artifact
                            </Button>
                          )}
                          {canViewArtifact && (
                            <Button
                              variant="outline"
                              className="h-6 w-[118px] text-xs justify-center border-muted-foreground/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground cursor-pointer"
                              onClick={() =>
                                router.push(
                                  `/channels/${channelSlug}/spaces/${spaceSlug}/milestones/${m.id}/artifacts`
                                )
                              }
                            >
                              View Artifacts
                            </Button>
                          )}
                        </div>
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground cursor-pointer"
                                disabled={isLoading}
                              >
                                {isLoading ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <MoreVertical className="h-4 w-4" />
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              {/* Mark In Progress — student or manager only */}
                              {(canArtifactAdd || canManage) &&
                                m.status === MilestoneStatus.INCOMPLETE && (
                                  <DropdownMenuItem
                                    className="cursor-pointer"
                                    onClick={() =>
                                      handleStatusChange(
                                        m.id,
                                        MilestoneStatus.IN_PROGRESS
                                      )
                                    }
                                  >
                                    <Clock className="h-3.5 w-3.5 mr-2 text-blue-500" />
                                    Mark In Progress
                                  </DropdownMenuItem>
                                )}

                              {/* Student actions */}
                              {canArtifactAdd &&
                                !canManage &&
                                (m.status === MilestoneStatus.IN_PROGRESS ? (
                                  <>
                                    <DropdownMenuItem
                                      className="cursor-pointer"
                                      onClick={() => {
                                        const arts = m.artifacts
                                        if (arts.length === 0) {
                                          // No artifacts yet — navigate to artifact page so student can add one first
                                          router.push(
                                            `/channels/${channelSlug}/spaces/${spaceSlug}/milestones/${m.id}/artifacts`
                                          )
                                        } else {
                                          handleStatusChange(
                                            m.id,
                                            MilestoneStatus.COMPLETED_PENDING_VERIFICATION
                                          )
                                        }
                                      }}
                                    >
                                      <Clock className="h-3.5 w-3.5 mr-2 text-amber-600" />
                                      Complete (Pending Verification)
                                    </DropdownMenuItem>
                                  </>
                                ) : (
                                  <>
                                    {m.status !==
                                      MilestoneStatus.INCOMPLETE && (
                                      <div className="px-2 py-2 space-y-0.5">
                                        <p className="text-xs font-medium text-muted-foreground/60">
                                          {m.status === MilestoneStatus.VERIFIED
                                            ? "Milestone Verified"
                                            : "Complete (Pending Verification)"}
                                        </p>
                                        <p className="text-xs text-muted-foreground/50 leading-snug">
                                          {m.status === MilestoneStatus.VERIFIED
                                            ? "Verified and approved by your advisor."
                                            : "Already submitted for verification."}
                                        </p>
                                      </div>
                                    )}
                                  </>
                                ))}

                              {/* Advisor / University Admin actions */}
                              {canManage && (
                                <>
                                  {canVerifyMilestone &&
                                    m.status ===
                                      MilestoneStatus.COMPLETED_PENDING_VERIFICATION && (
                                      <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() =>
                                          handleStatusChange(
                                            m.id,
                                            MilestoneStatus.VERIFIED
                                          )
                                        }
                                      >
                                        <CheckCircle2 className="h-3.5 w-3.5 mr-2 text-emerald-500" />
                                        Verify
                                      </DropdownMenuItem>
                                    )}

                                  {canRevertMilestone &&
                                    (m.status === MilestoneStatus.IN_PROGRESS ||
                                      m.status ===
                                        MilestoneStatus.COMPLETED_PENDING_VERIFICATION ||
                                      m.status ===
                                        MilestoneStatus.VERIFIED) && (
                                      <DropdownMenuItem
                                        className="cursor-pointer text-amber-600 focus:text-amber-600"
                                        onClick={() =>
                                          handleRevert(m.id, m.status)
                                        }
                                      >
                                        <RotateCcw className="h-3.5 w-3.5 mr-2" />
                                        Revert Status
                                      </DropdownMenuItem>
                                    )}

                                  {canUpdateMilestone &&
                                    m.status !== MilestoneStatus.VERIFIED && (
                                      <DropdownMenuItem
                                        className="cursor-pointer"
                                        onClick={() => handleStartEdit(m)}
                                      >
                                        <Pencil className="h-3.5 w-3.5 mr-2" />
                                        Rename
                                      </DropdownMenuItem>
                                    )}

                                  {canDeleteMilestone && (
                                    <>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="cursor-pointer text-destructive focus:text-destructive"
                                        onClick={() => handleDeleteClick(m)}
                                      >
                                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </>
                                  )}
                                </>
                              )}
                              {!canArtifactAdd && !canManage && (
                                <DropdownMenuItem
                                  disabled
                                  className="text-xs text-muted-foreground"
                                >
                                  You don&apos;t have permission to perform
                                  actions.
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    )
                  })()}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-start gap-x-8 gap-y-3 pt-1">
        {[
          {
            icon: <CheckCircle2 className="h-6 w-6 text-emerald-500" />,
            title: "Verified",
            desc: "Verified by Advisor"
          },
          {
            icon: <Clock className="h-6 w-6 text-amber-600" />,
            title: "Completed (Pending Verification)",
            desc: "Submitted by Student"
          },
          {
            icon: <Clock className="h-6 w-6 text-blue-500" />,
            title: "In Progress",
            desc: "Work in Progress"
          },
          {
            icon: <CircleDashed className="h-6 w-6 text-muted-foreground/50" />,
            title: "Incomplete",
            desc: "Not Started"
          }
        ].map(({ icon, title, desc }) => (
          <div key={title} className="flex items-center gap-2">
            <div className="shrink-0 mt-0.5">{icon}</div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-foreground leading-tight">
                {title}
              </span>
              <span className="text-xs text-muted-foreground leading-tight">
                {desc}
              </span>
            </div>
          </div>
        ))}
        <div className="flex items-start gap-2 ml-auto">
          {/* Small screens: icon-only with popover (click-safe on touch) */}
          <Popover>
            <PopoverTrigger asChild>
              <span className="sm:hidden mt-0.5 cursor-pointer">
                <Info className="h-6 w-6 text-muted-foreground" />
              </span>
            </PopoverTrigger>
            <PopoverContent
              side="top"
              className="max-w-[220px] text-xs text-center p-3"
            >
              Only Advisors and University Admins can verify or modify
              milestones.
            </PopoverContent>
          </Popover>
          {/* Larger screens: icon + full text */}
          <Info className="hidden sm:block h-6 w-6 text-muted-foreground shrink-0 mt-0.5" />
          <span className="hidden sm:block text-xs text-muted-foreground max-w-[200px] leading-snug">
            Only Advisors and University Admins can verify or modify milestones.
          </span>
        </div>
      </div>

      {/* ── Confirm delete ── */}
      <AlertDialog
        open={!!confirmDelete}
        onOpenChange={(v) => {
          if (!v) setConfirmDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete milestone?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span className="block">
                <strong>{confirmDelete?.name}</strong> is{" "}
                {(() => {
                  const m = milestones.find((x) => x.id === confirmDelete?.id)
                  const arts = m?.artifacts ?? []
                  const isIP = m?.status === MilestoneStatus.IN_PROGRESS
                  if (isIP && arts.length > 0)
                    return "currently In Progress and has submitted artifacts. Deleting it will permanently remove all associated artifacts."
                  if (isIP)
                    return "currently In Progress. Deleting it will remove all associated data."
                  return "associated with submitted artifacts. Deleting it will permanently remove those artifacts."
                })()}
              </span>
              <span className="block text-destructive font-medium">
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (confirmDelete) doDelete(confirmDelete.id)
                setConfirmDelete(null)
              }}
            >
              Yes, delete it
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
