import React, { useState } from 'react'
import { Button } from "@/src/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/src/components/ui/alert-dialog"
import { Edit3, Settings, Trash2 } from "lucide-react"
import { spaceStore } from '@/src/store/space/spaceStore'
import { useSetAtom } from 'jotai'
import { DeleteSpaceAction } from '@/src/server-actions/Space/Space'
import { useServerAction } from '@/src/hooks/useServerAction'
import { SelectSpace } from '@/src/db/schema'
import { toast } from '@/src/hooks/use-toast'
import { useRouter } from 'next/navigation'


interface Props {
  space: SelectSpace
}

function SpacesActionButtons({ space }: Props) {
  const setSpaces = useSetAtom(spaceStore.spaces)
  const setSelecteSpace = useSetAtom(spaceStore.selectedSpace)
  const setSpaceFormModelVisibility = useSetAtom(
    spaceStore.spaceFormModelVisibility
  )
  const [
    addDeleteSpaceLoading,
    addDeleteSpaceData,
    addDeleteSpaceError,
    deleteSpace
  ] = useServerAction(DeleteSpaceAction)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()


  function handleEditSpace(space: SelectSpace) {
    setSpaceFormModelVisibility(true)
    setSelecteSpace(space)
  }

  async function handleDeleteSpace(selectedSpace: SelectSpace) {
    const deletedSpace = await deleteSpace(selectedSpace)
    if (deletedSpace?.success) {
      setSpaces((spaces) =>
        spaces.filter((spaces) => spaces.id !== selectedSpace?.id)
      )
      toast({
        title: "Space deleted successfully.",
        duration: 3000
      })
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => {
          e.preventDefault();
          handleEditSpace(space)
        }}
      >
        <Edit3 />
      </Button>
      <Button
        variant="ghost" size="icon"
        onClick={(e) => {
          e.preventDefault();
          router.push(`./spaces/${space.space_slug}/settings`)
        }}>
        <Settings />
      </Button>
      <AlertDialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={(e) => {
              e.preventDefault();
              setIsOpen(true)
            }}
          >
            <Trash2 />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete space.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => {
              e.preventDefault();
              setIsOpen(false);
            }}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteSpace(space);
              }}
              loading={addDeleteSpaceLoading}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export default SpacesActionButtons