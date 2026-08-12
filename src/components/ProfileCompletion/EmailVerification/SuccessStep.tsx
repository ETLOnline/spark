"use client"

import { CheckCircle2 } from "lucide-react"
import { Button } from "@/src/components/ui/button"

interface SuccessStepProps {
  email: string
  onDone: () => void
}

export function SuccessStep({ email, onDone }: SuccessStepProps) {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-6">
      <div className="p-4 rounded-full bg-primary/10 text-primary">
        <CheckCircle2 className="h-10 w-10" />
      </div>
      <div className="space-y-1">
        <h4 className="text-base font-semibold">Identity Verified</h4>
        <p className="text-sm text-muted-foreground">
          Your identity has been verified using{" "}
          <span className="font-medium text-foreground">{email}</span>.
        </p>
      </div>
      <Button className="w-full" onClick={onDone}>
        Done
      </Button>
    </div>
  )
}
