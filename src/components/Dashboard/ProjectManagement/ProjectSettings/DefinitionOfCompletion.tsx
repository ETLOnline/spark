"use client"
import { Button } from "@/src/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/src/components/ui/select"
import { InsertTaskStatus } from "@/src/db/schema"
import React from "react"
import { ProjectStatus } from "../types/projectStatus.type"

interface Props {
  statusList: InsertTaskStatus[]
  value: string
  onChange: (val: string) => void
  error: string
  setError: (val: string) => void
}

function DefinitionOfCompletion({
  statusList,
  value,
  onChange,
  setError,
  error
}: Props) {
  const handleChange = (val: string) => {
    onChange(val)
    if (val === ProjectStatus.InProgress || val === ProjectStatus.ToDo) {
      setError("You cannot set this status as definition of completion")
    } else {
      setError("")
    }
  }

  return (
    <Card className="border shadow-none">
      <CardHeader className="py-3">
        <CardTitle className="text-base">Definition of Completion</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <Select value={value} onValueChange={handleChange}>
            <SelectTrigger className="max-w-sm">
              <SelectValue placeholder="Select definition of completion" />
            </SelectTrigger>
            <SelectContent className="max-h-[220px] overflow-auto">
              {statusList.map((status) => (
                <SelectItem key={status.name} value={status.status_slug || ""}>
                  {status.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

export default DefinitionOfCompletion
