"use client"

import { useEffect, useState } from "react"
import { Check, Copy, Mail, Search, User } from "lucide-react"

import { Button } from "@/src/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/src/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Checkbox } from "@/src/components/ui/checkbox"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { SelectChannel, SelectSpace, SelectUser } from "@/src/db/schema"
import { usePathname } from "next/navigation"
import { entityKind } from "drizzle-orm"
import { hostname } from "os"
import { isEntityChannel } from "@/src/utils/helpers"

// Sample data for platform users
const platformUsers: SelectUser[] = []

type InvitationType = string[]

interface InviteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  spaceName?: string
  type: InvitationType
  entityType: "space" | "channel"
  entity: SelectChannel | SelectSpace
}

export function InviteUserDialog({
  open,
  onOpenChange,
  type = ["link"],
  entityType,
  entity
}: InviteUserDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [emailInput, setEmailInput] = useState("")
  const [emailList, setEmailList] = useState<string[]>([])
  const [inviteMessage, setInviteMessage] = useState(
    `Join our ${entityType} on our platform!`
  )
  const [copied, setCopied] = useState(false)
  const [selectedType, setSelectedType] = useState(type[0])
  const [inviteLink, setInviteLink] = useState("")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.host
      const protocol = window.location.protocol
      const pathname = `${protocol}//${host}`
      const link = isEntityChannel(entity)
        ? `${pathname}/invite/${entity.id}?type=channel`
        : `${pathname}/invite/${entity.id}?type=space`
      setInviteLink(link)
    }
  }, [entity])

  // Filter platform users based on search query
  const filteredUsers = platformUsers.filter(
    (user) =>
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Toggle user selection
  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    )
  }

  // Add email to list
  const addEmail = () => {
    if (emailInput && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
      setEmailList((prev) => [...prev, emailInput])
      setEmailInput("")
    }
  }

  // Remove email from list
  const removeEmail = (email: string) => {
    setEmailList((prev) => prev.filter((e) => e !== email))
  }

  // Copy invite link
  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Send invitations
  const sendInvitations = () => {
    // Here you would implement the actual invitation logic
    console.log("Selected platform users:", selectedUsers)
    console.log("Email invitations:", emailList)
    console.log("Invite message:", inviteMessage)

    // Close the dialog
    onOpenChange(false)

    // Reset state
    setSelectedUsers([])
    setEmailList([])
    setSearchQuery("")
    setEmailInput("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Invite Users to {entityType}</DialogTitle>
          {/* <DialogDescription>Invite users to join your space either from the platform or via email.</DialogDescription> */}
          <DialogDescription>
            Invite users to join your{" "}
            {entityType === "space" ? "space" : "channel"} via{" "}
            {type.length > 1 ? type.join(", ") : type[0]} .
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue={type[0] ? type[0] : "platform"}
          className="w-full"
          onValueChange={(value) => {
            setSelectedType(value)
          }}
        >
          {type.length > 1 ? (
            <TabsList className="grid w-full grid-cols-3">
              {type.includes("platform") ? (
                <TabsTrigger value="platform">Platform Users</TabsTrigger>
              ) : null}

              {type.includes("email") ? (
                <TabsTrigger value="email">Email Invite</TabsTrigger>
              ) : null}

              {type.includes("link") ? (
                <TabsTrigger value="link">Invite Link</TabsTrigger>
              ) : null}
            </TabsList>
          ) : null}

          <TabsContent value="platform" className="space-y-4 py-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
              {filteredUsers.map((user) => (
                <div
                  key={user.unique_id}
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted cursor-pointer"
                  onClick={() => toggleUserSelection(user.unique_id)}
                >
                  <Checkbox
                    id={`user-${user.unique_id}`}
                    checked={selectedUsers.includes(user.unique_id)}
                    onCheckedChange={() => toggleUserSelection(user.unique_id)}
                  />
                  <Avatar>
                    <AvatarImage
                      src={user.profile_url || ""}
                      alt={user.first_name}
                    />
                    <AvatarFallback>
                      {user.first_name.charAt(0)}
                      {user.first_name.split(" ")[1]?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{user.first_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {user.email}
                    </div>
                  </div>
                </div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  No users found matching your search.
                </div>
              )}
            </div>

            <div className="pt-2">
              <Label htmlFor="invite-message">Invitation Message</Label>
              <Textarea
                id="invite-message"
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                className="mt-1"
                placeholder="Add a personal message to your invitation"
              />
            </div>
          </TabsContent>

          <TabsContent value="email" className="space-y-4 py-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter email address..."
                  className="pl-8"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addEmail()
                    }
                  }}
                />
              </div>
              <Button type="button" onClick={addEmail}>
                Add
              </Button>
            </div>

            {emailList.length > 0 && (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {emailList.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between bg-muted p-2 rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{email}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeEmail(email)}
                    >
                      <span className="sr-only">Remove</span>
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                      >
                        <path
                          d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
                          fill="currentColor"
                        />
                      </svg>
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2">
              <Label htmlFor="email-invite-message">Invitation Message</Label>
              <Textarea
                id="email-invite-message"
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                className="mt-1"
                placeholder="Add a personal message to your invitation"
              />
            </div>
          </TabsContent>

          <TabsContent value="link" className="space-y-4 py-4">
            <div className="text-center space-y-4">
              <div className="mx-auto bg-muted p-6 rounded-full w-16 h-16 flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium">Share Invite Link</h3>
              <p className="text-sm text-muted-foreground">
                Anyone with this link can join your {entityType}.
              </p>
            </div>

            <div className="flex gap-2">
              <Input readOnly value={inviteLink} className="flex-1" />
              <Button variant="outline" onClick={copyInviteLink}>
                {copied ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>

            {/* <div className="pt-2">
              <Label htmlFor="link-expiry">Link Settings</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Checkbox id="link-expiry" />
                <label
                  htmlFor="link-expiry"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Set expiration (7 days)
                </label>
              </div>
            </div> */}
          </TabsContent>
        </Tabs>

        {selectedType !== "link" ? (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={sendInvitations}>Send Invitations</Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
