import React, { useState } from "react"

import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/src/components/ui/dialog"
import { SelectMessage } from "@/src/db/schema"

interface EditMessageModalProps {
  message: SelectMessage
  onSave: (updatedText: string) => void
}

export default function EditMessageModal({
  message,
  onSave,
  onClose
}: {
  message: SelectMessage
  onSave: (updatedMessage: string) => void
  onClose: () => void
}) {
  const [value, setValue] = useState(message.message)

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="bg-[#111] text-white border border-neutral-800">
        <DialogHeader>
          <DialogTitle>Edit message</DialogTitle>
          <DialogDescription>Update your message below.</DialogDescription>
        </DialogHeader>

        <input
          className="w-full rounded-md bg-neutral-900 border border-neutral-700 p-3"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />

        <DialogFooter>
          <DialogClose asChild>
            <Button
              onClick={onClose}
              className="bg-neutral-700 text-white hover:bg-neutral-600"
            >
              Cancel
            </Button>
          </DialogClose>

          <Button
            onClick={() => onSave(value)}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
