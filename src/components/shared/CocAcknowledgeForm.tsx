"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/src/components/ui/button"
import { Checkbox } from "@/src/components/ui/checkbox"
import { Label } from "@/src/components/ui/label"
import { useServerAction } from "@/src/hooks/useServerAction"
import { updateUserProfileAction } from "@/src/server-actions/profile/profile"
import { useToast } from "@/src/hooks/use-toast"
import Link from "next/link"

interface CocAcknowledgeFormProps {
  userId: string
  /** When false, no button shown — parent handles submission */
  showButton?: boolean
  /** Called whenever checkbox state changes (used when showButton=false) */
  onCheckedChange?: (checked: boolean) => void
}

export function CocAcknowledgeForm({
  userId,
  showButton = true,
  onCheckedChange
}: CocAcknowledgeFormProps) {
  const [acknowledged, setAcknowledged] = useState(false)
  const [loading, , , updateProfile] = useServerAction(updateUserProfileAction)
  const { toast } = useToast()
  const router = useRouter()

  const handleCheckboxChange = (checked: boolean) => {
    setAcknowledged(checked)
    onCheckedChange?.(checked)
  }

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
    <div className="space-y-4 mt-4">
      <div className="flex items-start gap-3 rounded-xl border border-border bg-card/60 p-4">
        <Checkbox
          id="coc-checkbox"
          checked={acknowledged}
          onCheckedChange={(v) => handleCheckboxChange(v === true)}
          disabled={loading}
          className="mt-0.5"
        />
        <Label
          htmlFor="coc-checkbox"
          className="text-sm leading-relaxed cursor-pointer"
        >
          I have read and agree to the SPARK{" "}
          <Link
            href="/code-of-conduct"
            target="_blank"
            className="text-primary underline underline-offset-4 hover:text-primary/80"
          >
            Code of Conduct
          </Link>
          . I understand that violating these standards may result in the
          suspension or removal of my account.
        </Label>
      </div>

      {showButton && (
        <div className="flex pt-4 border-t justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!acknowledged || loading}
            loading={loading}
            className="w-full"
          >
            I Agree &amp; Continue to SPARK
          </Button>
        </div>
      )}
    </div>
  )
}
