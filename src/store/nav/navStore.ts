import { siteRoutes } from "@/src/components/Dashboard/Sidebar.tsx/constants/NavigationRoutes"
import { pageMeta } from "@/src/utils/constants"
import { atom } from "jotai"

const routes = atom(siteRoutes)
const crumbRoutes = atom(pageMeta)

export const navStore = {
  routes,
  crumbRoutes
}
