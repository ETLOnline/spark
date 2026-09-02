"use client"

import { ClipboardEdit, Flag, GraduationCap } from "lucide-react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/src/components/ui/tabs"
import FYPRequestStatus from "./FYPRequestStatus"
import FYPMilestones from "./FYPMilestones"
import FYPMom from "./FYPMom"

const TAB_TRIGGER_CLASS =
  "gap-1.5 rounded-none border-b-2 border-transparent bg-transparent px-0 py-3 text-sm font-medium text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none"

function SpaceFYP() {
  return (
    <div className="w-full">
      <div className="bg-background border-b px-4 sm:px-6 py-4 flex items-center gap-2">
        <GraduationCap className="w-5 h-5 shrink-0" />
        <h1 className="text-lg sm:text-xl font-semibold truncate">FYP</h1>
      </div>

      <Tabs defaultValue="request-status">
        <TabsList className="h-auto w-full justify-start gap-6 rounded-none border-b bg-transparent px-4 py-0 sm:px-6">
          <TabsTrigger value="request-status" className={TAB_TRIGGER_CLASS}>
            <GraduationCap className="h-4 w-4" />
            Request Status
          </TabsTrigger>
          <TabsTrigger value="milestones" className={TAB_TRIGGER_CLASS}>
            <Flag className="h-4 w-4" />
            Milestones
          </TabsTrigger>
          <TabsTrigger value="mom" className={TAB_TRIGGER_CLASS}>
            <ClipboardEdit className="h-4 w-4" />
            MOM
          </TabsTrigger>
        </TabsList>

        <div className="p-4 sm:p-6">
          <TabsContent value="request-status" className="mt-0">
            <FYPRequestStatus />
          </TabsContent>
          <TabsContent value="milestones" className="mt-0">
            <FYPMilestones />
          </TabsContent>
          <TabsContent value="mom" className="mt-0">
            <FYPMom />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

export default SpaceFYP
