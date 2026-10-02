"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/src/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/src/components/ui/tabs"
import { FileUpload } from "@/src/components/ui/file-upload"
import { useServerAction } from "@/src/hooks/useServerAction"
import { useToast } from "@/src/hooks/use-toast"
import { SubmitMilestoneArtifactAction } from "@/src/server-actions/Milestone/Milestone"
import type { MilestoneWithArtifacts } from "@/src/server-actions/Milestone/Milestone"
import { MilestoneArtifactEntry } from "@/src/types/Milestone/Milestone"
import { MILESTONE_ARTIFACT_ACCEPT } from "./constants"

export function AddArtifactDialog({
  open,
  milestoneId,
  onClose,
  onAdded
}: {
  open: boolean
  milestoneId: string
  onClose: () => void
  onAdded: (updated: MilestoneArtifactEntry[]) => void
}) {
  const { toast } = useToast()
  const [tab, setTab] = useState<"file" | "link">("file")
  const [link, setLink] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  const [, , , submitArtifact] = useServerAction(SubmitMilestoneArtifactAction)

  const reset = () => {
    setTab("file")
    setLink("")
    setSelectedFile(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const handleAdd = async () => {
    if (tab === "link") {
      if (!link.trim()) {
        toast({ title: "Please enter a URL", variant: "destructive" })
        return
      }
      try {
        new URL(link.trim())
      } catch {
        toast({ title: "Please enter a valid URL", variant: "destructive" })
        return
      }
      setIsAdding(true)
      try {
        const res = await submitArtifact(milestoneId, { link: link.trim() })
        if (res?.success && res.data) {
          onAdded(
            (res.data as MilestoneWithArtifacts)
              .artifacts as MilestoneArtifactEntry[]
          )
          toast({ title: "Link added" })
          handleClose()
        } else {
          toast({
            title:
              (res as { message?: string })?.message ?? "Failed to add link",
            variant: "destructive"
          })
        }
      } catch {
        toast({ title: "Failed to add link", variant: "destructive" })
      } finally {
        setIsAdding(false)
      }
    } else {
      if (!selectedFile) {
        toast({ title: "Please select a file", variant: "destructive" })
        return
      }
      setIsAdding(true)
      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve((reader.result as string).split(",")[1])
          reader.onerror = reject
          reader.readAsDataURL(selectedFile)
        })
        const res = await submitArtifact(milestoneId, {
          file: {
            name: selectedFile.name,
            sizeBytes: selectedFile.size,
            base64,
            mimeType: selectedFile.type
          }
        })
        if (res?.success && res.data) {
          onAdded(
            (res.data as MilestoneWithArtifacts)
              .artifacts as MilestoneArtifactEntry[]
          )
          toast({ title: "File uploaded" })
          handleClose()
        } else {
          toast({
            title:
              (res as { message?: string })?.message ?? "Failed to upload file",
            variant: "destructive"
          })
        }
      } catch {
        toast({ title: "Failed to upload file", variant: "destructive" })
      } finally {
        setIsAdding(false)
      }
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose()
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Artifact</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-1">
          <Tabs
            value={tab}
            onValueChange={(v) => {
              setTab(v as "file" | "link")
              setSelectedFile(null)
              setLink("")
            }}
          >
            <TabsList className="w-full">
              <TabsTrigger value="file" className="flex-1">
                Upload file
              </TabsTrigger>
              <TabsTrigger value="link" className="flex-1">
                Paste link
              </TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="space-y-3 pt-2">
              <FileUpload
                fileType="file"
                accept={MILESTONE_ARTIFACT_ACCEPT}
                multiple={false}
                onChange={(files) => setSelectedFile(files[0] ?? null)}
                onRemove={() => setSelectedFile(null)}
              />
              <p className="text-xs text-muted-foreground text-center">
                PDF, DOC, DOCX, or image (PNG, JPG, GIF, WebP). Max 200 MB.
              </p>
              <Button
                onClick={handleAdd}
                disabled={isAdding || !selectedFile}
                className="w-full cursor-pointer"
              >
                {isAdding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Upload
              </Button>
            </TabsContent>

            <TabsContent value="link" className="space-y-3 pt-2">
              <Input
                placeholder="https://github.com/..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAdd()
                }}
                autoFocus
              />
              <Button
                onClick={handleAdd}
                disabled={isAdding || !link.trim()}
                className="w-full cursor-pointer"
              >
                {isAdding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add Link
              </Button>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isAdding}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
