"use client"

import { useEffect, useMemo, useState } from "react"
import { useAtomValue } from "jotai"
import { Plus } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from "@/src/components/ui/alert-dialog"
import { useToast } from "@/src/hooks/use-toast"
import { useServerAction } from "@/src/hooks/useServerAction"
import { spaceStore } from "@/src/store/space/spaceStore"
import {
  CreateMomAction,
  DeleteMomAction,
  GetMomsForSpaceAction,
  UpdateMomAction
} from "@/src/server-actions/Mom/Mom"
import { GetSpaceUsersAction } from "@/src/server-actions/Space/Space"
import { SelectMom } from "@/src/db/schema"
import Loader from "@/src/components/common/Loader/Loader"
import { LoaderSizes } from "@/src/components/common/types/loader-types"
import MomList from "./mom/MomList"
import MomFormDialog from "./mom/MomFormDialog"
import { MomFormState } from "./mom/MomTypes"

function FYPMom() {
  const currentSpace = useAtomValue(spaceStore.currentSpace)
  const spaceId = currentSpace?.id
  const { toast } = useToast()

  const [moms, setMoms] = useState<SelectMom[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingMom, setEditingMom] = useState<SelectMom | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [getMomLoading, , , fetchMoms] = useServerAction(GetMomsForSpaceAction)
  const [isSaving, , , createMom] = useServerAction(CreateMomAction)
  const [isUpdating, , , updateMom] = useServerAction(UpdateMomAction)
  const [, , , deleteMom] = useServerAction(DeleteMomAction)
  const [spaceUsersLoading, spaceUsers, , fetchSpaceUsers] =
    useServerAction(GetSpaceUsersAction)

  const load = async () => {
    if (!spaceId) return
    setLoading(true)
    try {
      const [momsRes] = await Promise.all([
        fetchMoms(spaceId),
        fetchSpaceUsers(spaceId)
      ])
      if (momsRes?.success && momsRes.data) {
        setMoms(momsRes.data as SelectMom[])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [spaceId])

  const spaceMembers = useMemo(
    () =>
      spaceUsers?.success && spaceUsers.data
        ? spaceUsers.data.filter((su) => su.user)
        : [],
    [spaceUsers]
  )

  const participantOptions = useMemo(
    () =>
      spaceMembers.map((su) => ({
        label: `${su.user!.first_name} ${su.user!.last_name}`,
        value: su.user!.unique_id
      })),
    [spaceMembers]
  )

  const participantNameById = useMemo(
    () =>
      Object.fromEntries(
        spaceMembers.map((su) => [
          su.user!.unique_id,
          `${su.user!.first_name} ${su.user!.last_name}`
        ])
      ),
    [spaceMembers]
  )

  const handleOpenCreate = () => {
    setEditingMom(null)
    setFormOpen(true)
  }

  const handleOpenEdit = (mom: SelectMom) => {
    setEditingMom(mom)
    setFormOpen(true)
  }

  const handleCloseForm = () => {
    setFormOpen(false)
    setEditingMom(null)
  }

  const handleSave = async (form: MomFormState) => {
    if (!spaceId) return

    const payload = {
      meeting_date: form.meeting_date,
      meeting_start_time: form.meeting_start_time,
      meeting_end_time: form.meeting_end_time,
      participants: form.participants,
      discussion_summary: form.discussion_summary,
      action_items: form.action_items
    }

    const res = editingMom
      ? await updateMom(editingMom.id, payload)
      : await createMom(spaceId, payload)

    if (res?.success && res.data) {
      const savedMom = res.data as SelectMom
      setMoms((prev) =>
        editingMom
          ? prev.map((m) => (m.id === savedMom.id ? savedMom : m))
          : [savedMom, ...prev]
      )
      toast({
        title: editingMom ? "Minutes updated" : "Minutes logged successfully"
      })
      handleCloseForm()
    } else {
      toast({
        title: editingMom
          ? "Failed to update minutes"
          : "Failed to log minutes",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    const res = await deleteMom(deleteId)
    if (res?.success) {
      setMoms((prev) => prev.filter((m) => m.id !== deleteId))
      toast({ title: "Minutes deleted" })
    } else {
      toast({ title: "Failed to delete minutes", variant: "destructive" })
    }
    setDeleteId(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader size={LoaderSizes.xl} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Minutes of Meeting</h2>
          <p className="text-xs text-muted-foreground">
            Keep a record of discussions and decisions from your project
            meetings.
          </p>
        </div>
        <Button size="sm" onClick={handleOpenCreate}>
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Log Meeting
        </Button>
      </div>

      <MomList
        moms={moms}
        participantNameById={participantNameById}
        onEdit={handleOpenEdit}
        onDelete={setDeleteId}
      />

      <MomFormDialog
        open={formOpen}
        initial={editingMom ?? undefined}
        isSubmitting={isSaving || isUpdating}
        participantOptions={participantOptions}
        participantsLoading={spaceUsersLoading}
        onClose={handleCloseForm}
        onSave={handleSave}
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete these minutes?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this meeting record. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default FYPMom
