import React from "react"
import { AlertCircle, Settings } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../../ui/dialog"
import { Button } from "../../ui/button"
import { useRouter } from "next/navigation"

interface Props {
  openDialog: boolean
}

function StatusRequiredDialog({ openDialog }: Props) {
  const router = useRouter()

  return (
    <Dialog open={openDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Status Required
          </DialogTitle>
          <DialogDescription>
            You need to add a statuses to access this project. Please go to the
            project settings page to set up project statuses.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            className="gap-2"
            onClick={() => router.push(`./settings?tab=taskStatus`)}
          >
            <Settings className="h-4 w-4" />
            Go to Project Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default StatusRequiredDialog
