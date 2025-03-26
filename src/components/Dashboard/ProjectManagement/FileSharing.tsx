"use client"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/src/components/ui/dialog"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Textarea } from "@/src/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import {
  File,
  FileText,
  FileImage,
  FileArchive,
  FilePlus,
  FolderPlus,
  Search,
  MoreHorizontal,
  Download,
  Share,
  Trash,
  MessageSquare,
  Send,
} from "lucide-react"

interface FileComment {
  id: string
  author: {
    name: string
    avatar: string
  }
  content: string
  createdAt: string
}

interface ProjectFile {
  id: string
  name: string
  type: "document" | "image" | "archive" | "other"
  size: string
  uploadedBy: {
    name: string
    avatar: string
  }
  uploadedAt: string
  comments: FileComment[]
  folder: string
}

const sampleFiles: ProjectFile[] = [
  {
    id: "1",
    name: "Project Requirements.docx",
    type: "document",
    size: "245 KB",
    uploadedBy: { name: "Alex Johnson", avatar: "/avatars/01.png" },
    uploadedAt: "2023-05-10T10:30:00Z",
    comments: [
      {
        id: "c1",
        author: { name: "Sarah Miller", avatar: "/avatars/02.png" },
        content: "I've reviewed this and added some comments in the document.",
        createdAt: "2023-05-11T14:20:00Z",
      },
    ],
    folder: "Documentation",
  },
  {
    id: "2",
    name: "UI Mockups.fig",
    type: "other",
    size: "4.2 MB",
    uploadedBy: { name: "Sarah Miller", avatar: "/avatars/02.png" },
    uploadedAt: "2023-05-12T15:45:00Z",
    comments: [],
    folder: "Design",
  },
  {
    id: "3",
    name: "Homepage Design.png",
    type: "image",
    size: "1.8 MB",
    uploadedBy: { name: "Sarah Miller", avatar: "/avatars/02.png" },
    uploadedAt: "2023-05-13T09:15:00Z",
    comments: [
      {
        id: "c2",
        author: { name: "Alex Johnson", avatar: "/avatars/01.png" },
        content: "This looks great! Can we adjust the color scheme slightly?",
        createdAt: "2023-05-13T11:30:00Z",
      },
      {
        id: "c3",
        author: { name: "David Chen", avatar: "/avatars/03.png" },
        content: "I agree with Alex. The colors need to match our brand guidelines.",
        createdAt: "2023-05-13T13:45:00Z",
      },
    ],
    folder: "Design",
  },
  {
    id: "4",
    name: "Database Schema.pdf",
    type: "document",
    size: "520 KB",
    uploadedBy: { name: "David Chen", avatar: "/avatars/03.png" },
    uploadedAt: "2023-05-14T11:20:00Z",
    comments: [],
    folder: "Documentation",
  },
  {
    id: "5",
    name: "Project Assets.zip",
    type: "archive",
    size: "24.5 MB",
    uploadedBy: { name: "Emma Wilson", avatar: "/avatars/04.png" },
    uploadedAt: "2023-05-15T14:10:00Z",
    comments: [],
    folder: "Assets",
  },
  {
    id: "6",
    name: "API Documentation.md",
    type: "document",
    size: "128 KB",
    uploadedBy: { name: "James Taylor", avatar: "/avatars/05.png" },
    uploadedAt: "2023-05-16T10:05:00Z",
    comments: [],
    folder: "Documentation",
  },
]

export function FileSharing() {
  const [files, setFiles] = useState<ProjectFile[]>(sampleFiles)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [newComment, setNewComment] = useState("")
  const [activeFolder, setActiveFolder] = useState<string | null>(null)

  const handleAddComment = () => {
    if (!selectedFile || !newComment.trim()) return

    const comment: FileComment = {
      id: `c${Date.now()}`,
      author: { name: "Current User", avatar: "/avatars/04.png" },
      content: newComment,
      createdAt: new Date().toISOString(),
    }

    const updatedFiles = files.map((file) =>
      file.id === selectedFile.id ? { ...file, comments: [...file.comments, comment] } : file,
    )

    setFiles(updatedFiles)
    setNewComment("")
    setIsCommentDialogOpen(false)
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "document":
        return <FileText className="h-6 w-6 text-blue-500" />
      case "image":
        return <FileImage className="h-6 w-6 text-green-500" />
      case "archive":
        return <FileArchive className="h-6 w-6 text-yellow-500" />
      default:
        return <File className="h-6 w-6 text-gray-500" />
    }
  }

  const folders = Array.from(new Set(files.map((file) => file.folder)))

  const filteredFiles = files.filter(
    (file) =>
      (activeFolder ? file.folder === activeFolder : true) &&
      (file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.uploadedBy.name.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold">Files & Documents</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <FilePlus className="mr-2 h-4 w-4" />
                Upload File
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload File</DialogTitle>
                <DialogDescription>Upload a file to share with your team.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="file-upload" className="text-right">
                    File
                  </Label>
                  <Input id="file-upload" type="file" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="file-folder" className="text-right">
                    Folder
                  </Label>
                  <select
                    id="file-folder"
                    className="col-span-3 flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select folder</option>
                    {folders.map((folder) => (
                      <option key={folder} value={folder}>
                        {folder}
                      </option>
                    ))}
                    <option value="new">Create new folder...</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="file-description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="file-description"
                    className="col-span-3"
                    placeholder="Optional description for this file"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setIsUploadDialogOpen(false)}>Upload</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-64 space-y-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start font-normal" onClick={() => setActiveFolder(null)}>
              All Files
            </Button>
            {folders.map((folder) => (
              <Button
                key={folder}
                variant={activeFolder === folder ? "secondary" : "ghost"}
                className="w-full justify-start font-normal"
                onClick={() => setActiveFolder(folder)}
              >
                {folder}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex-1">
          <Tabs defaultValue="grid">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="grid">Grid</TabsTrigger>
                <TabsTrigger value="list">List</TabsTrigger>
              </TabsList>
              <div className="text-sm text-muted-foreground">
                {filteredFiles.length} {filteredFiles.length === 1 ? "file" : "files"}
              </div>
            </div>
            <TabsContent value="grid" className="mt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFiles.map((file) => (
                  <Card key={file.id} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                      <div className="flex items-center space-x-2">
                        {getFileIcon(file.type)}
                        <div>
                          <CardTitle className="text-base">{file.name}</CardTitle>
                          <CardDescription>{file.size}</CardDescription>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedFile(file)
                              setIsCommentDialogOpen(true)
                            }}
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Comment
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share className="mr-2 h-4 w-4" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center">
                          <Avatar className="h-6 w-6 mr-2">
                            <AvatarImage src={file.uploadedBy.avatar} />
                            <AvatarFallback>{file.uploadedBy.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">{file.uploadedBy.name}</span>
                        </div>
                        {file.comments.length > 0 && (
                          <Badge variant="secondary">
                            <MessageSquare className="mr-1 h-3 w-3" />
                            {file.comments.length}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="list" className="mt-0">
              <Card>
                <CardContent className="p-0">
                  <div className="rounded-md border">
                    <div className="grid grid-cols-12 gap-2 p-4 bg-muted/50 text-sm font-medium">
                      <div className="col-span-5 sm:col-span-6">Name</div>
                      <div className="col-span-3 hidden sm:block">Uploaded By</div>
                      <div className="col-span-2 hidden md:block">Size</div>
                      <div className="col-span-3 sm:col-span-2 md:col-span-1">Actions</div>
                    </div>
                    {filteredFiles.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">No files found</div>
                    ) : (
                      filteredFiles.map((file) => (
                        <div key={file.id} className="grid grid-cols-12 gap-2 p-4 border-t items-center">
                          <div className="col-span-5 sm:col-span-6 flex items-center">
                            {getFileIcon(file.type)}
                            <div className="ml-2">
                              <div className="font-medium">{file.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(file.uploadedAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="col-span-3 hidden sm:flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={file.uploadedBy.avatar} />
                              <AvatarFallback>{file.uploadedBy.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{file.uploadedBy.name}</span>
                          </div>
                          <div className="col-span-2 hidden md:block text-sm">{file.size}</div>
                          <div className="col-span-3 sm:col-span-2 md:col-span-1 flex items-center justify-end space-x-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                setSelectedFile(file)
                                setIsCommentDialogOpen(true)
                              }}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Share className="mr-2 h-4 w-4" />
                                  Share
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  <Trash className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Comment Dialog */}
      <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comments on {selectedFile?.name}</DialogTitle>
            <DialogDescription>View and add comments to this file.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[300px] overflow-y-auto space-y-4 my-4">
            {selectedFile?.comments.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">No comments yet</div>
            ) : (
              selectedFile?.comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author.avatar} />
                    <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{comment.author.name}</p>
                      <p className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleString()}</p>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/avatars/04.png" />
              <AvatarFallback>CU</AvatarFallback>
            </Avatar>
            <Input
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1"
            />
            <Button size="sm" onClick={handleAddComment}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

