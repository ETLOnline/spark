import React from "react"

export type NavSubItem = {
  title: string
  url: string
  icon?: React.ComponentType
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
