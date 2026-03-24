import React from "react"

import { motion, AnimatePresence } from "framer-motion"
import { CanvasRevealEffect } from "@/src/components/ui/canvas-reveal-effect"
import { ShieldOff } from "lucide-react"

const MotionDiv = motion.div
const UnauthorizedScreen = () => {
  return (
    <>
      <AnimatePresence>
        <div className="h-full w-full absolute inset-0">
          <CanvasRevealEffect
            animationSpeed={3}
            containerClassName="bg-black"
            colors={[
              [236, 72, 153],
              [232, 121, 249]
            ]}
            dotSize={2}
          />
        </div>
      </AnimatePresence>
      <div className="absolute text:white text-4xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <ShieldOff size={120} className="text-center w-full" />
        <div>Unauthorized Access</div>
      </div>
    </>
  )
}

export default UnauthorizedScreen
