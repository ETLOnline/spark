export type NavItem = {
  title: string
  url: string
  icon: React.ComponentType
  isActive?: boolean
  items?: {
    title: string
    url: string
  }[]
}

export type SiteRoutes = {
  [navSection: string]: NavItem[]
}
