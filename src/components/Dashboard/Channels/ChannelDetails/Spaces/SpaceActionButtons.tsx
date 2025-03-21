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
  AlertDialogOverlay,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/src/components/ui/alert-dialog"
import { MoreVertical, Pencil, Settings, Trash2 } from "lucide-react"
import { spaceStore } from '@/src/store/space/spaceStore'
import { useSetAtom } from 'jotai'
import { DeleteSpaceAction } from '@/src/server-actions/Space/Space'
import { useServerAction } from '@/src/hooks/useServerAction'
import { SelectSpace } from '@/src/db/schema'
import { toast } from '@/src/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogOverlay, DialogTitle, DialogTrigger } from '@/src/components/ui/dialog'


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
  const [openMenu, setOpenMenu] = useState(false)
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


      <Dialog open={openMenu} onOpenChange={(open) => { setOpenMenu(open) }}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => {
            e.preventDefault();
            setOpenMenu(true)
          }}>
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Open actions</span>
          </Button>
        </DialogTrigger>
        <DialogOverlay onClick={(e) => {
          e.preventDefault();
          setOpenMenu(false)
        }} />
        <DialogContent className="sm:max-w-[425px]"
          onClick={(e) => {
            e.preventDefault();
          }}>
          <DialogTitle className="text-center mb-4">Space Actions</DialogTitle>
          <div className="grid gap-3">
            <Button variant="outline" className="flex justify-start"
              onClick={(e) => {
                e.preventDefault();
                handleEditSpace(space);
                setOpenMenu(false)
              }}>
              <Pencil className="mr-2 h-4 w-4" />
              <span>Edit Space</span>
            </Button>
            <AlertDialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
              <AlertDialogTrigger asChild >
                <Button
                  size="icon"
                  variant="outline"
                  className="flex justify-start w-full pl-4"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(true);
                  }}
                >
                  <Trash2 className=" h-4 w-4" />
                  <span>Delete Space</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogOverlay
                onClick={(e) => {
                  e.preventDefault();
                  setIsOpen(false)
                }}>
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
                        setOpenMenu(false)
                      }}
                      loading={addDeleteSpaceLoading}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialogOverlay>
            </AlertDialog>
            <Button variant="outline" className="flex justify-start"
              onClick={(e) => {
                e.preventDefault();
                router.push(`./spaces/${space.space_slug}/settings`)
                setOpenMenu(false)
              }}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Space Settings</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default SpacesActionButtons