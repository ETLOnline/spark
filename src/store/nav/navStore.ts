import { siteRoutes } from "@/src/components/Dashboard/Sidebar.tsx/constants/NavigationRoutes"
import { atom } from "jotai"


const routes = atom(siteRoutes)

export const navStore = {
  routes
}
