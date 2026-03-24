"use server"

import { beamsServerClient } from "./BeamServerClient"

export async function beamsAuthAction(userId: string) {
  // Generate token
  const beamsToken = beamsServerClient.generateToken(userId)

  return beamsToken
}
