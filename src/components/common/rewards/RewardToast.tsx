"use client"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport
} from "@/src/components/ui/toast"
import { Star } from "lucide-react" // Using Lucide for the star icon
import { rewardToast, useRewardToast } from "./Hook/UseRewardToastHook"
import { useEffect } from "react"
import { useAtomValue } from "jotai"
import pusherClient from "@/src/services/realtime/PusherClient"
import { SelectPointLedger, SelectUserRewardBalance } from "@/src/db/schema"
import { userStore } from "@/src/store/user/userStore"

export function RewardToast() {
  const { toasts } = useRewardToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, reward, ...props }) {
        return (
          <Toast key={id} {...props} className="p-0 flex flex-col w-auto">
            {/* Header */}
            <ToastTitle className="text-lg font-bold flex-1 flex items-center justify-between w-full spark-gradient-panel-bg text-white px-4 py-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-white" />
                {title}
              </div>
              <ToastClose className="static text-white opacity-100 hover:text-white/80" />
            </ToastTitle>

            {/* Body */}
            <ToastDescription className=" bg-muted/50 w-full flex flex-col  justify-between px-4 py-3 !m-0">
              {description}
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider">
                  REWARD EARNED
                </span>
                <span className="text-2xl font-black ">+{reward}</span>
              </div>
            </ToastDescription>
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
