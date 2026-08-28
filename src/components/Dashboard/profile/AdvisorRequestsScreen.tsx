"use client"

import { useMemo, useState } from "react"
import { GraduationCap } from "lucide-react"
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/src/components/ui/tabs"
import { RequestDetailsDialog } from "./RequestDetailsDialog"

export type RequestStatus = "pending" | "accepted" | "rejected" | "expired"
type StatusTab = "all" | RequestStatus

export interface AdvisorRequest {
  id: string
  studentName: string
  initials: string
  fypTitle: string
  domain: string
  submittedOn: string
  status: RequestStatus
  groupMembers: { name: string; regNo: string }[]
  universitySupervisor: string
  abstract: string
  problemStatement: string
  techStack: string
  proposalFile: { name: string; size: string }
}

// TODO: replace with real data once the advisor_requests table/server actions exist.
const MOCK_REQUESTS: AdvisorRequest[] = [
  {
    id: "1",
    studentName: "Hamza Khalid",
    initials: "HK",
    fypTitle: "AI-Powered Campus Navigation System",
    domain: "AI / Machine Learning",
    submittedOn: "Aug 15, 2026",
    status: "pending",
    groupMembers: [
      { name: "Hamza Khalid", regNo: "FA21-BCS-045" },
      { name: "Zainab Riaz", regNo: "FA21-BCS-061" }
    ],
    universitySupervisor: "Dr. Sana Malik",
    abstract:
      "This project proposes an AI-powered navigation system that helps students and visitors find their way around campus using real-time indoor positioning and personalized route suggestions.",
    problemStatement:
      "Large university campuses often lack intuitive indoor navigation, leading to wasted time and confusion for new students, especially during the first few weeks of the semester.",
    techStack: "React, Node.js, PostgreSQL, TensorFlow",
    proposalFile: { name: "Proposal_HamzaKhalid.pdf", size: "2.4 MB" }
  },
  {
    id: "2",
    studentName: "Ayesha Noor",
    initials: "AN",
    fypTitle: "Blockchain-Based Voting System",
    domain: "Blockchain",
    submittedOn: "Aug 12, 2026",
    status: "pending",
    groupMembers: [{ name: "Ayesha Noor", regNo: "FA21-BCS-018" }],
    universitySupervisor: "Dr. Imran Sheikh",
    abstract:
      "A blockchain-based voting system designed to provide a transparent, tamper-proof mechanism for student council elections.",
    problemStatement:
      "Current manual/paper-based voting for student elections is prone to disputes over tampering and lacks a verifiable audit trail.",
    techStack: "Solidity, React, Ethers.js, Hardhat",
    proposalFile: { name: "Proposal_AyeshaNoor.pdf", size: "1.8 MB" }
  },
  {
    id: "3",
    studentName: "Bilal Ahmed",
    initials: "BA",
    fypTitle: "Smart Traffic Management using IoT",
    domain: "IoT / Embedded Systems",
    submittedOn: "Aug 5, 2026",
    status: "accepted",
    groupMembers: [
      { name: "Bilal Ahmed", regNo: "FA21-BCS-022" },
      { name: "Hassan Raza", regNo: "FA21-BCS-029" }
    ],
    universitySupervisor: "Dr. Sana Malik",
    abstract:
      "An IoT-based smart traffic management system that dynamically adjusts signal timing using live congestion data from road-side sensors.",
    problemStatement:
      "Fixed-timing traffic signals cause unnecessary congestion at intersections during off-peak hours and fail to adapt to real-time traffic conditions.",
    techStack: "Arduino, Python, MQTT, Node.js",
    proposalFile: { name: "Proposal_BilalAhmed.pdf", size: "3.1 MB" }
  },
  {
    id: "4",
    studentName: "Sara Fatima",
    initials: "SF",
    fypTitle: "E-Commerce Fraud Detection Model",
    domain: "AI / Machine Learning",
    submittedOn: "Aug 3, 2026",
    status: "rejected",
    groupMembers: [{ name: "Sara Fatima", regNo: "FA21-BCS-051" }],
    universitySupervisor: "Dr. Imran Sheikh",
    abstract:
      "A machine learning model that flags fraudulent transactions on e-commerce platforms in real time using behavioral and transactional features.",
    problemStatement:
      "Rising fraudulent transactions on e-commerce platforms result in significant financial losses and erode customer trust.",
    techStack: "Python, scikit-learn, FastAPI, PostgreSQL",
    proposalFile: { name: "Proposal_SaraFatima.pdf", size: "2.0 MB" }
  },
  {
    id: "5",
    studentName: "Usman Tariq",
    initials: "UT",
    fypTitle: "AR-Based Campus Tour Guide App",
    domain: "AR / VR",
    submittedOn: "Jul 28, 2026",
    status: "expired",
    groupMembers: [
      { name: "Usman Tariq", regNo: "FA21-BCS-037" },
      { name: "Noman Aslam", regNo: "FA21-BCS-040" }
    ],
    universitySupervisor: "Dr. Sana Malik",
    abstract:
      "An augmented reality mobile app that provides an interactive, self-guided campus tour for prospective students and visitors.",
    problemStatement:
      "New visitors and prospective students often struggle to explore campus facilities without a guided tour, which isn't always available.",
    techStack: "Unity, ARKit, ARCore, Firebase",
    proposalFile: { name: "Proposal_UsmanTariq.pdf", size: "4.5 MB" }
  }
]

export const STATUS_BADGE: Record<RequestStatus, string> = {
  pending: "bg-amber-500/15 text-amber-600",
  accepted: "bg-emerald-500/15 text-emerald-500",
  rejected: "bg-red-500/15 text-red-500",
  expired: "bg-foreground/10 text-muted-foreground"
}

export const STATUS_LABEL: Record<RequestStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  expired: "Expired"
}

export function AdvisorRequestsScreen() {
  const [activeTab, setActiveTab] = useState<StatusTab>("all")
  const [selectedRequest, setSelectedRequest] = useState<AdvisorRequest | null>(
    null
  )

  const requests = useMemo(() => {
    if (activeTab === "all") return MOCK_REQUESTS
    return MOCK_REQUESTS.filter((r) => r.status === activeTab)
  }, [activeTab])

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 gap-3">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as StatusTab)}
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="accepted">Accepted</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="flex flex-col gap-3 mt-3">
          {requests.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No requests in this category
            </p>
          )}

          {requests.map((request) => (
            <div
              key={request.id}
              className="rounded-lg border border-foreground/8 p-4"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback>{request.initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">
                      {request.studentName}
                    </p>
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-primary/10 text-primary shrink-0">
                      {request.domain}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-0.5 flex items-center gap-1">
                    <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                    {request.fypTitle}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Submitted {request.submittedOn}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded ${STATUS_BADGE[request.status]}`}
                  >
                    {STATUS_LABEL[request.status]}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedRequest(request)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>

      <RequestDetailsDialog
        request={selectedRequest}
        onOpenChange={(open) => {
          if (!open) setSelectedRequest(null)
        }}
      />
    </div>
  )
}
