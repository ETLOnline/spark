import { siteRoutes } from "@/src/components/Dashboard/Sidebar.tsx/constants/NavigationRoutes"
import { PermissionChecker } from "@/src/lib/PermissionCheker"
import { pageMeta } from "@/src/utils/constants"
import { atom } from "jotai"

const routes = atom(siteRoutes)
const crumbRoutes = atom(pageMeta)
const permissionCheckerAtom = atom<PermissionChecker | null>(null)
const isNavLoading = atom<boolean>(true)

export const navStore = {
  routes,
  crumbRoutes,
  permissionCheckerAtom,
  isNavLoading
}
