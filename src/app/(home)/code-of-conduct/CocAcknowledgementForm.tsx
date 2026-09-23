"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/src/components/ui/checkbox"
import { Label } from "@/src/components/ui/label"
import { Button } from "@/src/components/ui/button"
import { useServerAction } from "@/src/hooks/useServerAction"
import { updateUserProfileAction } from "@/src/server-actions/profile/profile"
import { useToast } from "@/src/hooks/use-toast"

interface CocAcknowledgementFormProps {
  userId: string
}

export function CocAcknowledgementForm({
  userId
}: CocAcknowledgementFormProps) {
  const [acknowledged, setAcknowledged] = useState(false)
  const [loading, , , updateProfile] = useServerAction(updateUserProfileAction)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async () => {
    if (!acknowledged) return
    const res = await updateProfile(userId, { coc_acknowledged: true })
    if (res?.success) {
      router.push("/profile")
    } else {
      toast({
        title: "Something went wrong. Please try again.",
        variant: "destructive",
        duration: 2000
      })
    }
  }

  return (
    <div className="bg-card/70 backdrop-blur-sm border border-primary/30 rounded-2xl p-8 shadow-lg space-y-5">
      <h3 className="text-lg font-semibold text-foreground">
        Acknowledge &amp; Continue
      </h3>

      <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">
        <Checkbox
          id="coc-ack"
          checked={acknowledged}
          onCheckedChange={(v) => setAcknowledged(v === true)}
          className="mt-0.5"
        />
        <Label
          htmlFor="coc-ack"
          className="text-sm leading-relaxed cursor-pointer text-foreground/80"
        >
          I have read and agree to the SPARK Code of Conduct. I understand that
          violating these standards may result in the suspension or removal of
          my account.
        </Label>
      </div>

      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={!acknowledged || loading}
        loading={loading}
      >
        I Agree &amp; Continue to SPARK
      </Button>
    </div>
  )
}
