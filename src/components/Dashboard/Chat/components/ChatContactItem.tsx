'use client'
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar"
import { Badge } from "@/src/components/ui/badge"
import { SelectChat } from "@/src/db/schema"
import { chatStore } from "@/src/store/chat/chatStore"
import { userStore } from "@/src/store/user/userStore"
import Avvvatars from "avvvatars-react"
import { useAtom, useAtomValue, useSetAtom } from "jotai"

const ChatContactItem = ({ chat }: { chat: SelectChat }) => {
  const authUser = useAtomValue(userStore.AuthUser)
  const [currentChat, setCurrentChat] = useAtom(chatStore.currentChat)
  const setSwtichedChat = useSetAtom(chatStore.switchedChat)
  const setIsMobileMenuOpen = useSetAtom(chatStore.isMobileMenuOpen)


  const filteredContact = chat?.users?.find((user) => user.user_id !== authUser?.unique_id)
  if (!filteredContact) return null
  const chatContact = filteredContact?.user || null
  if (!chatContact) return null

  return (
    <div
      key={chat.id}
      className={`flex items-center space-x-4 p-3 rounded-lg cursor-pointer transition-colors ${currentChat?.id === chat.id ? "bg-secondary" : "hover:bg-secondary/50"
        }`}
      onClick={() => {
        setSwtichedChat(chat || null)
        setIsMobileMenuOpen(false)
      }}
    >
      {
        chat?.is_group ? (
          <Avvvatars value={chat.name || ''} style='shape' />
        ):(
          <Avatar className="h-10 w-10 relative bg-white" >
            {
              !chat?.is_group && chatContact ? (
                <>
                  {chatContact?.profile_url ? (<AvatarImage src={chatContact.profile_url} />) : null}
                  <AvatarFallback>{chatContact.first_name.charAt(0)}</AvatarFallback>
                </>
              ) : null
            }
            {/* {chat.online && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></span>
            )} */}
          </Avatar>
        )
      }
      <div className="flex-1 max-w-[80%]">
        <p className="font-medium">{chat.is_group ? chat.name : `${chatContact?.first_name} ${chatContact?.last_name}`}</p>
        <p className="text-sm text-muted-foreground truncate">{chat?.last_message}</p>
      </div>
      {(chat?.unread_count || 0) > 0 && (
        <Badge variant="secondary" className="rounded-full px-2 py-1">
          {chat?.unread_count}
        </Badge>
      )}
    </div>
  )
}

export default ChatContactItem