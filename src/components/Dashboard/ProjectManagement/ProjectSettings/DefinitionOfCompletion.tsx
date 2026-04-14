"use client"
import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/src/components/ui/select"
import { Plus } from "lucide-react"
import React from "react"
import { projectDefaultStatuses } from "../constants/projectManagment"
import { InsertTaskStatus, SelectTaskStatus } from "@/src/db/schema"

interface Props {
  statusList: InsertTaskStatus[]
  value: string
  onChange: (val: string) => void
}

function DefinitionOfCompletion({ statusList, value, onChange }: Props) {
  return (
    <Card className="border shadow-none">
      <CardHeader className="py-3">
        <CardTitle className="text-base">Definition of Completion</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row items-center gap-2">
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="max-w-sm">
              <SelectValue placeholder="Select definition of completion" />
            </SelectTrigger>
            <SelectContent>
              {statusList.map((status) => (
                <SelectItem key={status.name} value={status.name || ""}>
                  {status.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}

export default DefinitionOfCompletion
