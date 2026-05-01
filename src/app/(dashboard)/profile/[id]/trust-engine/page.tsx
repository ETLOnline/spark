import TrustEngineScreen from "@/src/components/Dashboard/profile/trust-engine/TrustEngineScreen"
import { FindUserByUniqueIdAction } from "@/src/server-actions/User/FindUserByUniqueIdAction"
import React from "react"

interface Props {
  params: Promise<{ id: string }>
}

const TrustEngineDashboard = async ({ params }: Props) => {
  const { id } = await params
  const userRes = await FindUserByUniqueIdAction(id)
  const userName = userRes?.data?.first_name ?? ""

  return (
    <div>
      <TrustEngineScreen userId={id} userName={userName} />
    </div>
  )
}

export default TrustEngineDashboard
