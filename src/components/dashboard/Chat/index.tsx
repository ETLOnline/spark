"use client"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/src/components/ui/sheet"
import { Menu, Search, Send, Phone, Video, MoreVertical } from 'lucide-react'
import { Badge } from "@/src/components/ui/badge"

interface Message {
  id: string
  sender: string
  content: string
  timestamp: string
}

interface Chat {
  id: string
  name: string
  avatar: string
  lastMessage: string
  unreadCount: number
  online: boolean
}

const sampleMessages: Message[] = [
  { id: "1", sender: "Alice", content: "Hey, how's it going?", timestamp: "2023-04-15T10:30:00Z" },
  { id: "2", sender: "You", content: "Not bad, just working on a new project. You?", timestamp: "2023-04-15T10:32:00Z" },
  { id: "3", sender: "Alice", content: "That sounds interesting! I'm preparing for a presentation.", timestamp: "2023-04-15T10:35:00Z" },
  { id: "4", sender: "You", content: "Good luck with your presentation! Let me know if you need any help.", timestamp: "2023-04-15T10:37:00Z" },
  { id: "5", sender: "Alice", content: "Thanks! I appreciate that. How's your project coming along?", timestamp: "2023-04-15T10:40:00Z" },
]

const sampleChats: Chat[] = [
  { id: "1", name: "Alice Johnson", avatar: "/avatars/01.png", lastMessage: "That sounds interesting!", unreadCount: 0, online: true },
  { id: "2", name: "Bob Smith", avatar: "/avatars/02.png", lastMessage: "Can you help me with...", unreadCount: 2, online: false },
  { id: "3", name: "Web Dev Group", avatar: "/avatars/03.png", lastMessage: "Charlie: Check out this new framework", unreadCount: 5, online: true },
]

export function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>(sampleMessages)
  const [newMessage, setNewMessage] = useState("")
  const [chats, setChats] = useState<Chat[]>(sampleChats)
  const [activeChat, setActiveChat] = useState<Chat>(chats[0])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = () => {
    if (newMessage.trim() === "") return
    const newMsg: Message = {
      id: (messages.length + 1).toString(),
      sender: "You",
      content: newMessage,
      timestamp: new Date().toISOString(),
    }
    setMessages([...messages, newMsg])
    setNewMessage("")
    // Here you would typically send the message to Ably
    // ably.channel('chat').publish('message', newMsg);
  }

  const ContactsList = () => (
    <ScrollArea className="h-[calc(100vh-20rem)]">
      {chats.map((chat) => (
        <div
          key={chat.id}
          className={`flex items-center space-x-4 p-3 rounded-lg cursor-pointer transition-colors ${
            activeChat.id === chat.id ? "bg-secondary" : "hover:bg-secondary/50"
          }`}
          onClick={() => {
            setActiveChat(chat)
            setIsMobileMenuOpen(false)
          }}
        >
          <Avatar className="h-10 w-10 relative">
            <AvatarImage src={chat.avatar} alt={chat.name} />
            <AvatarFallback>{chat.name[0]}</AvatarFallback>
            {chat.online && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
            )}
          </Avatar>
          <div className="flex-1">
            <p className="font-medium">{chat.name}</p>
            <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
          </div>
          {chat.unreadCount > 0 && (
            <Badge variant="secondary" className="rounded-full px-2 py-1">
              {chat.unreadCount}
            </Badge>
          )}
        </div>
      ))}
    </ScrollArea>
  )

  return (
    <div className="flex h-full">
      {/* Contacts list - visible on desktop, hidden on mobile */}
      <Card className="w-80 flex-shrink-0 border-r hidden md:flex md:flex-col">
        <CardHeader>
          <CardTitle>Chats</CardTitle>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search chats..." className="pl-8" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ContactsList />
        </CardContent>
      </Card>

      {/* Main chat area */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <div className="flex items-center">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden mr-2">
                  <Menu />
                  <span className="sr-only">Toggle contacts</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[80%] sm:w-[385px] p-0">
                <CardHeader>
                  <CardTitle>Chats</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search chats..." className="pl-8" />
                  </div>
                </CardHeader>
                <ContactsList />
              </SheetContent>
            </Sheet>
            <Avatar className="h-9 w-9">
              <AvatarImage src={activeChat.avatar} alt={activeChat.name} />
              <AvatarFallback>{activeChat.name[0]}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{activeChat.name}</p>
              <p className="text-sm text-muted-foreground">
                {activeChat.online ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Phone className="h-4 w-4" />
              <span className="sr-only">Start voice call</span>
            </Button>
            <Button variant="ghost" size="icon">
              <Video className="h-4 w-4" />
              <span className="sr-only">Start video call</span>
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More options</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-4">
          <ScrollArea className="h-[calc(100vh-16rem)] pr-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 flex ${
                  message.sender === "You" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-lg p-3 max-w-[70%] ${
                    message.sender === "You"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </ScrollArea>
        </CardContent>
        <CardFooter className="p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSendMessage()
            }}
            className="flex w-full space-x-2"
          >
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}

