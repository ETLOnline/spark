import React, { ReactNode } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import { ListTodo, LucideProps } from "lucide-react"

interface Props {
  title: string
  icon: ReactNode
  content: ReactNode
}

function ProjectStatCards({ title, icon, content }: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  )
}

export default ProjectStatCards
