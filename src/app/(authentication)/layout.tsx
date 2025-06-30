import { ScrollArea } from "@/src/components/ui/scroll-area"
import Image from "next/image"
import React, { ReactNode } from "react"

const Authticationlayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className=" flex flex-wrap items-center h-screen w-full justify-center">
      {children}
    </div>
  )
}

export default Authticationlayout
