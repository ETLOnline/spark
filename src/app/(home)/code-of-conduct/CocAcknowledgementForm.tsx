"use client"

import { useRouter } from "next/navigation"
import { CocAcknowledgeForm } from "@/src/components/shared/CocAcknowledgeForm"

interface CocAcknowledgementFormProps {
  userId: string
}

export function CocAcknowledgementForm({
  userId
}: CocAcknowledgementFormProps) {
  const router = useRouter()

  return (
    <div className="bg-card/70 backdrop-blur-sm border border-primary/30 rounded-2xl p-8 shadow-lg space-y-5">
      <h3 className="text-lg font-semibold text-foreground">
        Acknowledge &amp; Continue
      </h3>
      <CocAcknowledgeForm
        userId={userId}
        submitLabel="I Agree & Continue to SPARK"
        onSuccess={() => router.push("/profile")}
      />
    </div>
  )
}
