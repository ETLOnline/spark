"use client"

import type React from "react"

import { useState, useEffect, Dispatch, SetStateAction } from "react"
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
import { Button } from "@/src/components/ui/button"
import { X } from "lucide-react"

interface UnsavedChangesDialogProps {
  showConfirmation: boolean
  setShowConfirmation: Dispatch<SetStateAction<boolean>>
  isActualDialogOpen?: boolean
  setIsActualDialogOpen: Dispatch<SetStateAction<boolean>>
}

export function UnsavedChangesDialog({
  showConfirmation,
  setShowConfirmation,
  setIsActualDialogOpen
}: UnsavedChangesDialogProps) {
  return (
    <>
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. What would you like to do with them?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => setIsActualDialogOpen(false)}>
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
