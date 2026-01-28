"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { GetEntityHierarchyAction } from "@/src/server-actions/EntityHierarcy/entityHierarcy"

export interface NormalizedHierarchy {
  projectId?: string
  spaceId?: string
  channelId?: string
  communityId?: string
}

export function useEntityHierarchy() {
  const pathname = usePathname()

  const [hierarchy, setHierarchy] = useState<NormalizedHierarchy | null>(null)

  const getEntityFromPath = (pathname: string) => {
    const segments = pathname.split("/").filter(Boolean)

    if (segments[0] === "communities" && segments[1]) {
      return { type: "community", id: segments[1] }
    }

    if (segments[0] === "project" && segments[1]) {
      return { type: "project", id: segments[1] }
    }

    if (segments[0] === "channels" && segments[2] === "spaces" && segments[3]) {
      return { type: "space", id: segments[3] }
    }

    if (segments[0] === "channels" && segments[1]) {
      return { type: "channel", id: segments[1] }
    }

    return null
  }

  function normalizeHierarchy(type: string, data: any): NormalizedHierarchy {
    switch (type) {
      case "project":
        return {
          projectId: data.id,
          spaceId: data.space?.id,
          channelId: data.space?.channel?.id,
          communityId: data.space?.channel?.community?.id
        }

      case "space":
        return {
          spaceId: data.id,
          channelId: data.channel?.id,
          communityId: data.channel?.community?.id
        }

      case "channel":
        return {
          channelId: data.id,
          communityId: data.community?.id
        }

      case "community":
        return {
          communityId: data.id
        }

      default:
        return {}
    }
  }

  const fetchAndNormalizeHierarchy = async () => {
    const entity = getEntityFromPath(pathname)
    if (!entity) return

    const res = await GetEntityHierarchyAction(entity.type, entity.id)
    if (!res.success || !res.data) return

    const normalized = normalizeHierarchy(entity.type, res.data)
    setHierarchy(normalized)
  }

  useEffect(() => {
    fetchAndNormalizeHierarchy()
  }, [pathname])

  return { hierarchy }
}
