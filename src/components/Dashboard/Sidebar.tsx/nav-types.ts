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
  /**
   * Additional paths that should also mark this item as active.
   * "/x" matches that exact path only; "/x/*" matches /x and every path under it.
   */
  extraActivePaths?: string[]
  /**
   * For items with sub-items: page to open when the item itself is clicked.
   * Without it, clicking the item only expands/collapses its sub-menu.
   */
  href?: string
}

export type SiteRoutes = {
  [navSection: string]: NavItem[]
}
