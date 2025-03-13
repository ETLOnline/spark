export type NavSubItem = {
  title: string
  url: string
}

export type NavItem = {
  title: string
  url: string
  icon: React.ComponentType
  isActive?: boolean
  items?: NavSubItem[]
}

export type SiteRoutes = {
  [navSection: string]: NavItem[]
}
