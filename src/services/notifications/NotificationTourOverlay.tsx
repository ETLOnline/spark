import React from "react"
import {
  ArrowBigLeftDash,
  ArrowBigLeftDashIcon,
  ArrowUpLeft
} from "lucide-react"
import { Dialog, DialogOverlay } from "@/src/components/ui/dialog"
import Image from "next/image"

interface NotificationTourOverlayProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

function NotificationTourOverlay({
  isOpen,
  setIsOpen
}: NotificationTourOverlayProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogOverlay>
        <div className="h-full w-full flex flex-col gap-4 justify-center items-center">
          <div className="  rotate-2">
            <ArrowUpLeft className="w-24 h-24 font-bold " />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-center">Notifications</h1>
            <p className="text-center ">
              Press "Allow" to enable notifications
            </p>
          </div>
          <div>
            <Image
              src={"/images/notification/notification-indication.jpg"}
              alt="notification"
              className="rounded-md"
              width={450}
              height={450}
              quality={100}
            />
          </div>
        </div>
      </DialogOverlay>
    </Dialog>
  )
}

export default NotificationTourOverlay
