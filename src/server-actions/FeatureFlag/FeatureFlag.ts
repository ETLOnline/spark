"use server"
import {
  createFeatureFlag,
  getFeatureFlag,
  updateFeatureFlag
} from "@/src/db/data-access/feature-flags/query"
import { CreateServerAction } from ".."

export const getFeatureFlagAction = CreateServerAction(
  true,
  async (key: string) => {
    try {
      const flag = await getFeatureFlag(key)
      return { success: true, data: flag }
    } catch (error: any) {
      return { error: error.message, data: null }
    }
  }
)
export const getFeatureFlagWithoutAuthenticationAction = CreateServerAction(
  false,
  async (key: string) => {
    try {
      const flag = await getFeatureFlag(key)
      return { success: true, data: flag }
    } catch (error: any) {
      return { error: error.message, data: null }
    }
  }
)

export const createFeatureFlagAction = CreateServerAction(
  true,
  async (payload: {
    key: string
    label: string
    is_enabled?: boolean
    description?: string
  }) => {
    try {
      const flag = await createFeatureFlag({
        key: payload.key,
        label: payload.label,
        is_enabled: payload.is_enabled ?? false,
        description: payload.description
      })
      return { success: true, data: flag }
    } catch (error: any) {
      return { error: error.message, data: null }
    }
  }
)

export const updateFeatureFlagAction = CreateServerAction(
  true,
  async (
    key: string,
    changes: {
      label?: string
      is_enabled?: boolean
      description?: string
    }
  ) => {
    try {
      const flag = await updateFeatureFlag(key, changes)
      return { success: true, data: flag }
    } catch (error: any) {
      return { error: error.message, data: null }
    }
  }
)
