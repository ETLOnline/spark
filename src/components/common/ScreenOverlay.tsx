import React from "react"
import Loader from "./Loader/Loader"
import { LoaderSizes } from "./types/loader-types"

function ScreenOverlay() {
  return (
    <div className="absolute h-screen inset-0 bg-background/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4 text-center overflow-hidden">
      <Loader size={LoaderSizes.xl} />
    </div>
  )
}

export default ScreenOverlay
