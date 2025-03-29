import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/src/components/ui/card'
import React, { useState } from 'react'
import { Input } from '@/src/components/ui/input'
import { Button } from '@/src/components/ui/button'
import { Plus, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import { Badge } from '@/src/components/ui/badge'


interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  avatar: string
}

const sampleTeamMembers: TeamMember[] = [
  { id: "1", name: "Alex Johnson", email: "alex@example.com", role: "Project Manager", avatar: "/avatars/01.png" },
  { id: "2", name: "Sarah Miller", email: "sarah@example.com", role: "UI/UX Designer", avatar: "/avatars/02.png" },
  { id: "3", name: "David Chen", email: "david@example.com", role: "Backend Developer", avatar: "/avatars/03.png" },
  { id: "4", name: "Emma Wilson", email: "emma@example.com", role: "Frontend Developer", avatar: "/avatars/04.png" },
  { id: "5", name: "James Taylor", email: "james@example.com", role: "QA Engineer", avatar: "/avatars/05.png" },
  { id: "6", name: "Olivia Brown", email: "olivia@example.com", role: "Product Owner", avatar: "/avatars/06.png" },
  { id: "7", name: "Michael Lee", email: "michael@example.com", role: "DevOps Engineer", avatar: "/avatars/07.png" },
  {
    id: "8",
    name: "Sophia Garcia",
    email: "sophia@example.com",
    role: "Frontend Developer",
    avatar: "/avatars/08.png",
  },
]

function TeamMembers() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(sampleTeamMembers)
  const [newMemberEmail, setNewMemberEmail] = useState("")

  const handleRemoveMember = (id: string) => {
    setTeamMembers(teamMembers.filter((member) => member.id !== id))
  }


  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Members</CardTitle>
        <CardDescription>Manage the team members for this project</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Input
            placeholder="Add member by email"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            className="flex-1"
          />
          <Select defaultValue="member">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>

        <div className="rounded-md border">
          <div className="grid grid-cols-12 gap-2 p-4 bg-muted/50 text-sm font-medium">
            <div className="col-span-5 sm:col-span-4">Name</div>
            <div className="col-span-5 sm:col-span-4 hidden md:block">Email</div>
            <div className="col-span-5 sm:col-span-3">Role</div>
            <div className="col-span-2 sm:col-span-1"></div>
          </div>
          {teamMembers.map((member) => (
            <div key={member.id} className="grid grid-cols-12 gap-2 p-4 border-t items-center">
              <div className="col-span-5 sm:col-span-4 flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarImage src={member.avatar} />
                  <AvatarFallback>{member.name[0]}</AvatarFallback>
                </Avatar>
                <span className="font-medium">{member.name}</span>
              </div>
              <div className="col-span-5 sm:col-span-4 hidden md:block text-sm text-muted-foreground">
                {member.email}
              </div>
              <div className="col-span-5 sm:col-span-3">
                <Badge variant="outline">{member.role}</Badge>
              </div>
              <div className="col-span-2 sm:col-span-1 text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleRemoveMember(member.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default TeamMembers