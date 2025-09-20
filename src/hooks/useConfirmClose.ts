import { useState, useCallback } from "react"

type UseConfirmCloseProps = {
  isDirty: boolean
  onClose: () => void
}

export function useConfirmClose({ isDirty, onClose }: UseConfirmCloseProps) {
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleClose = useCallback(
    (open: boolean) => {
      if (!open && isDirty) {
        setShowConfirmation(true)
        return
      }
      onClose()
    },
    [isDirty, onClose]
  )

  return {
    showConfirmation,
    setShowConfirmation,
    handleClose
  }
}
