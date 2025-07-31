"use server"
import {
  AddCommunities,
  AddMentors,
  GetSiteSettings,
  siteSettinsFilters
} from "@/src/db/data-access/site-settings/query"
import { CreateServerAction } from ".."

export const GetSitSettingsAction = CreateServerAction(
  false,
  async (filters?: siteSettinsFilters) => {
    try {
      const siteSettings = await GetSiteSettings({ ...filters })

      return { success: true, data: siteSettings }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to fetch site settings"
      }
    }
  }
)

export const AddMentorsAction = CreateServerAction(
  true,
  async (data: string[]) => {
    try {
      const mentors = await AddMentors(data)
      return {
        success: true,
        data: mentors
      }
    } catch (error) {
      return {
        success: false,
        error: error
      }
    }
  }
)

export const AddCommunitiesAction = CreateServerAction(
  true,
  async (data: string[]) => {
    try {
      const mentors = await AddCommunities(data)
      return {
        success: true,
        data: mentors
      }
    } catch (error) {
      return {
        success: false,
        error: error
      }
    }
  }
)
