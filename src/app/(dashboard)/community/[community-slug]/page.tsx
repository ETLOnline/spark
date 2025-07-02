"use client"

import React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/src/components/ui/card"
import {
  Hash,
  Users,
  MessageCircle,
  Calendar,
  Settings,
  UserPlus,
  Lock,
  Globe
} from "lucide-react"

// Static demo data for the community page
const demoCommunity = {
  name: "Tech Innovators",
  description:
    "A community for technology enthusiasts, developers, and innovators to share ideas and collaborate",
  type: "public" as const,
  totalMembers: 2847,
  onlineMembers: 89,
  totalMessages: 45672,
  createdYear: 2023,
  category: "Technology",
  owner: "Sarah Johnson"
}

const demoChannels = [
  {
    name: "general",
    unread: 12,
    isLocked: false,
    lastActivity: "2 minutes ago",
    members: 2847
  },
  {
    name: "dev-chat",
    unread: 5,
    isLocked: false,
    lastActivity: "15 minutes ago",
    members: 1234
  },
  {
    name: "project-showcase",
    unread: 0,
    isLocked: false,
    lastActivity: "1 hour ago",
    members: 892
  },
  {
    name: "resources",
    unread: 3,
    isLocked: false,
    lastActivity: "3 hours ago",
    members: 1567
  },
  {
    name: "admin-only",
    unread: 0,
    isLocked: true,
    lastActivity: "1 day ago",
    members: 12
  }
]

const demoRules = [
  "Be respectful and professional",
  "No spam or self-promotion without permission",
  "Keep discussions relevant to technology",
  "Help others and share knowledge",
  "Follow Discord community guidelines"
]

interface CommunityPageProps {
  params: Promise<{
    "community-slug": string
  }>
}

export default function CommunityPage({ params }: CommunityPageProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col min-h-screen">
        {/* Community Header Banner */}
        <div className="relative bg-gradient-to-r from-gray-500 to-gray-600 px-4 py-6 md:px-6 md:py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              {/* Community Avatar */}
              <div className="relative">
                <Avatar className="h-16 w-16 md:h-20 md:w-20 border-4 border-white">
                  <AvatarImage
                    src="/placeholder.png"
                    alt={demoCommunity.name}
                  />
                  <AvatarFallback className="text-xl md:text-2xl font-bold">
                    TI
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Community Info */}
              <div className="text-white flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <h1 className="text-xl md:text-2xl font-bold">
                    {demoCommunity.name}
                  </h1>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <Badge variant="secondary" className="text-xs">
                      {demoCommunity.type === "public" ? "Public" : "Private"}
                    </Badge>
                  </div>
                </div>
                <p className="text-gray-200 mb-3 text-sm md:text-base max-w-2xl">
                  {demoCommunity.description}
                </p>
                <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>
                      {demoCommunity.totalMembers.toLocaleString()} members
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>•</span>
                    <span>{demoCommunity.onlineMembers} online</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white text-xs"
                  >
                    {demoCommunity.category}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 self-start md:self-auto">
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <UserPlus className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Invite</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Settings className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Options</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex border-t">
          {/* Left Sidebar */}
          <div className="flex-1 overflow-auto p-4 md:p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="lg:hidden">
                <div className="grid grid-cols-2 gap-4 text-center mb-6">
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="text-xl font-bold">
                      {demoCommunity.totalMembers.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Members</div>
                  </div>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="text-xl font-bold">
                      {demoCommunity.onlineMembers}
                    </div>
                    <div className="text-sm text-muted-foreground">Online</div>
                  </div>
                </div>
              </div>

              {/* Text Channels */}
              <div className="bg-background rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Hash className="h-5 w-5" />
                    Text Channels
                  </h3>
                  <Badge variant="destructive" className="text-sm">
                    {demoChannels.reduce(
                      (total, channel) => total + channel.unread,
                      0
                    )}{" "}
                    unread
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {demoChannels.length} channels available
                </p>
                <div className="space-y-2">
                  {demoChannels.map((channel) => (
                    <div
                      key={channel.name}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {channel.isLocked ? (
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <Hash className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{channel.name}</span>
                          {channel.unread > 0 && (
                            <Badge
                              variant="destructive"
                              className="text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center"
                            >
                              {channel.unread}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        <div>{channel.lastActivity}</div>
                        <div>{channel.members} members</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Community Rules */}
              <div className="bg-background rounded-lg border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-primary-foreground">
                      📋
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold">Community Rules</h3>
                </div>
                <div className="space-y-3">
                  {demoRules.map((rule, index) => (
                    <div key={index} className="flex gap-4">
                      <span className="text-muted-foreground font-medium min-w-[24px] shrink-0">
                        {index + 1}.
                      </span>
                      <span className="text-muted-foreground leading-relaxed">
                        {rule}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="hidden lg:block w-80 xl:w-96 border-l bg-muted/10 p-6 space-y-6 overflow-y-auto">
            {/* Community Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base lg:text-lg">
                  Community Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs lg:text-sm">Total Members</span>
                  </div>
                  <span className="font-bold text-sm lg:text-base">
                    {demoCommunity.totalMembers.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-xs lg:text-sm">Online Now</span>
                  </div>
                  <span className="font-bold text-sm lg:text-base">
                    {demoCommunity.onlineMembers}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs lg:text-sm">Total Messages</span>
                  </div>
                  <span className="font-bold text-sm lg:text-base">
                    {demoCommunity.totalMessages.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs lg:text-sm">Created</span>
                  </div>
                  <span className="font-bold text-sm lg:text-base">
                    {demoCommunity.createdYear}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* About Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base lg:text-lg">About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Owner
                  </span>
                  <p className="text-sm">{demoCommunity.owner}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Category
                  </span>
                  <p className="text-sm">{demoCommunity.category}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Privacy
                  </span>
                  <div className="flex items-center gap-2">
                    {demoCommunity.type === "public" ? (
                      <Globe className="h-4 w-4 text-green-500" />
                    ) : (
                      <Lock className="h-4 w-4 text-yellow-500" />
                    )}
                    <span className="text-sm capitalize">
                      {demoCommunity.type}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">
                    Community ID
                  </span>
                  <p className="text-xs font-mono text-muted-foreground">
                    uuid-tech-innovators
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
