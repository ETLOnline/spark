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
import { taskStore } from "@/src/store/tasks/taskStore"
import { useSetAtom } from "jotai"
import React, { Dispatch, SetStateAction } from "react"

interface Props {
  isAlertOpen: boolean
  setIsAlertDialogOpen: Dispatch<SetStateAction<boolean>>
}

function ConfirmationDialog({ isAlertOpen, setIsAlertDialogOpen }: Props) {
  const setIsTaskMoveDialogOpen = useSetAtom(taskStore.isTaskMoveDialogOpen)
  return (
    <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Move Parent Task and Its Child Tasks
          </AlertDialogTitle>
          <AlertDialogDescription>
            This task has child tasks linked to it. Moving this parent task will
            also move all of its child tasks to the new location (sprint or
            backlog). Do you want to continue?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => setIsTaskMoveDialogOpen(true)}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default ConfirmationDialog
