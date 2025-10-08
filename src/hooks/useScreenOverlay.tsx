"use client"
import React, { createContext, useContext, useState, ReactNode } from "react"
import ScreenOverlay from "../components/common/ScreenOverlay"

type ScreenOverlayContextType = {
  showOverlay: () => void
  hideOverlay: () => void
}

const ScreenOverlayContext = createContext<ScreenOverlayContextType | null>(
  null
)

export function ScreenOverlayProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false)

  const showOverlay = () => setVisible(true)
  const hideOverlay = () => setVisible(false)

  return (
    <ScreenOverlayContext.Provider value={{ showOverlay, hideOverlay }}>
      {children}
      {visible && <ScreenOverlay />}
    </ScreenOverlayContext.Provider>
  )
}

export function useScreenOverlay() {
  const context = useContext(ScreenOverlayContext)
  if (!context)
    throw new Error(
      "useScreenOverlay must be used within a ScreenOverlayProvider"
    )
  return context
}
