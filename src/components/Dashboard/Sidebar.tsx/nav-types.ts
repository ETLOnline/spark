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
  permission?: string
  isActive?: boolean
  items?: NavSubItem[]
  isPrivate?: boolean
}

export type SiteRoutes = {
  [navSection: string]: NavItem[]
}
