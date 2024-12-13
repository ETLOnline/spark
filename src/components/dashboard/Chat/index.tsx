'use client'
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { ScrollArea } from "@/src/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import { UserPlus, Users } from 'lucide-react'

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
}

const sampleMessages: Message[] = [
  { id: "1", sender: "Alice", content: "Hey, how's it going?", timestamp: "2023-04-15T10:30:00Z" },
  { id: "2", sender: "You", content: "Not bad, just working on a new project. You?", timestamp: "2023-04-15T10:32:00Z" },
  { id: "3", sender: "Alice", content: "That sounds interesting! I'm preparing for a presentation.", timestamp: "2023-04-15T10:35:00Z" },
]

const sampleChats: Chat[] = [
  { id: "1", name: "Alice Johnson", avatar: "/avatars/01.png", lastMessage: "That sounds interesting!", unreadCount: 0 },
  { id: "2", name: "Bob Smith", avatar: "/avatars/02.png", lastMessage: "Can you help me with...", unreadCount: 2 },
  { id: "3", name: "Web Dev Group", avatar: "/avatars/03.png", lastMessage: "Charlie: Check out this new framework", unreadCount: 5 },
]

export function Chat() {
  const [messages, setMessages] = useState<Message[]>(sampleMessages)
  const [newMessage, setNewMessage] = useState("")
  const [chats, setChats] = useState<Chat[]>(sampleChats)
  const [activeChat, setActiveChat] = useState<Chat>(chats[0])

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
  }

  return (
    <Card className=" flex flex-col">
      <CardHeader>
        <CardTitle>Chat</CardTitle>
      </CardHeader>
      <Tabs defaultValue="direct" className="flex-1 flex flex-col">
        <TabsList className="w-full">
          <TabsTrigger value="direct" className="flex-1">Direct Messages</TabsTrigger>
          <TabsTrigger value="group" className="flex-1">Group Chats</TabsTrigger>
        </TabsList>
        <div className="flex-1 flex">
          <Card className="w-1/3 border-r">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Chats</CardTitle>
                <Button variant="ghost" size="icon">
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[calc(100vh-25rem)]">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`flex items-center space-x-4 p-2 rounded-lg cursor-pointer ${
                      activeChat.id === chat.id ? "bg-secondary" : "hover:bg-secondary/50"
                    }`}
                    onClick={() => setActiveChat(chat)}
                  >
                    <Avatar>
                      <AvatarImage src={chat.avatar} alt={chat.name} />
                      <AvatarFallback>{chat.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{chat.name}</p>
                      <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                    </div>
                    {chat.unreadCount > 0 && (
                      <div className="bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs">
                        {chat.unreadCount}
                      </div>
                    )}
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
          <Card className="flex-1 flex flex-col">
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src={activeChat.avatar} alt={activeChat.name} />
                  <AvatarFallback>{activeChat.name[0]}</AvatarFallback>
                </Avatar>
                <CardTitle>{activeChat.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <ScrollArea className="h-[calc(100vh-25rem)] px-4" >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 ${
                      message.sender === "You" ? "text-right" : "text-left"
                    }`}
                  >
                    <div
                      className={`inline-block p-2 rounded-lg ${
                        message.sender === "You"
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary"
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
            <CardFooter>
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
                <Button type="submit">Send</Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      </Tabs>
    </Card>
  )
}

