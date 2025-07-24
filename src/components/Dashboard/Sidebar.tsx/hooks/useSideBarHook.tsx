import { SelectChannel, SelectSpace, SelectUser } from "@/src/db/schema"
import { useServerAction } from "@/src/hooks/useServerAction"
import { GetChannelsAction } from "@/src/server-actions/Channel/Channel"
import { AuthUserAction } from "@/src/server-actions/User/AuthUserAction"
import { channelStore } from "@/src/store/channel/channelStore"
import { navStore } from "@/src/store/nav/navStore"
import { joinChannelsAndSpacesChannel } from "@/src/utils/helpers"
import { useAtom, useAtomValue, useSetAtom } from "jotai"
import { useEffect } from "react"
import {
  getChannelsCrumbsMapped,
  getChannelsNavMapped,
  getSpacesCrumbsMapped,
  getSpacesFeatureCrumbsMapped
} from "../utils/helpers"
import { useParams, useSearchParams } from "next/navigation"
import { userStore } from "@/src/store/user/userStore"
import { PageMeta } from "@/src/utils/constants"
import { PermissionChecker } from "@/src/lib/PermissionCheker"

const useSideBarHook = () => {
  const [routes, setRoutes] = useAtom(navStore.routes)
  const user = useAtomValue(userStore.AuthUser)

  const permission = useAtomValue(userStore.Permissions)
  const [permissionChecker, setPermissionChecker] = useAtom(
    navStore.permissionCheckerAtom
  )
  const isSuperAdmin = Boolean(useAtomValue(userStore.SuperAdmin))
  const [isNavLoading, setIsNavLoading] = useAtom(navStore.isNavLoading)

  const searchParams = useSearchParams()
  const currPageType = searchParams.get("page-type")

  const userData = user

  useEffect(() => {
    if (
      (permission && !permissionChecker) ||
      (isSuperAdmin && !permissionChecker)
    ) {
      const checker = new PermissionChecker("global", permission, isSuperAdmin)
      setPermissionChecker(checker)
    }
  }, [permission, permissionChecker, isSuperAdmin])

  useEffect(() => {
    if (!permissionChecker) return

    const filterdRoutes = routes.navMain.filter((route) => {
      if (!route.permission) return true
      return permissionChecker?.canAccess(route.permission)
    })

    if (userData) {
      setRoutes((routes) => {
        return {
          ...routes,
          navMain: filterdRoutes
        }
      })
      setIsNavLoading(false)
    }
  }, [userData, permission, permissionChecker, isSuperAdmin, currPageType])
}

export default useSideBarHook
