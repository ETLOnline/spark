import { BookOpen, FileText, LinkIcon } from 'lucide-react'
import React from 'react'
import Link from "next/link"

interface Resource {
  id: string
  title: string
  type: "document" | "link" | "image"
  url: string
}

interface Props {
  resources: Resource[]
}

function ProjectResources({ resources }: Props) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-2">Resources</h3>
      <div className="space-y-2">
        {resources.map((resource) => (
          <div key={resource.id} className="flex items-center">
            {resource.type === "document" && <FileText className="mr-2 h-4 w-4" />}
            {resource.type === "link" && <LinkIcon className="mr-2 h-4 w-4" />}
            {resource.type === "image" && <BookOpen className="mr-2 h-4 w-4" />}
            <Link href={resource.url} className="text-sm text-blue-500 hover:underline">{resource.title}</Link>
          </div>
        ))}
      </div>
    </div >
  )
}

export default ProjectResources