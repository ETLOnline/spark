import React from "react"

export type NavSubItem = {
  title: string
  url: string
  icon?: React.ComponentType
}

export type NavItem = {
  title: string
  url: string
  icon?: React.ComponentType
  permission?: string
  isActive?: boolean
  items?: NavSubItem[]
  isPrivate?: boolean
  /** Additional paths that should also mark this item as active */
  extraActivePaths?: string[]
}

export type SiteRoutes = {
  [navSection: string]: NavItem[]
}
