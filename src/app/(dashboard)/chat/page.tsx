import { ChatScreen } from "@/src/components/dashboard/Chat";
import { SelectChat } from "@/src/db/schema";
import { GetChatBySlugWithMessagesAction, GetUserChatsAction } from "@/src/server-actions/Chat/Chat";

interface ChatPageProps {
    searchParams:{
        active_chat?: string
    }
}

export default async function ChatPage({ searchParams }: ChatPageProps) {
    let currentChat : SelectChat | undefined = undefined
    let allChats : SelectChat[] = []

    const chatsRes = await GetUserChatsAction()
    if(chatsRes?.success && chatsRes?.data){
        allChats = chatsRes.data
    }


    if(searchParams.active_chat){
        const currentChatRes = await GetChatBySlugWithMessagesAction(searchParams.active_chat)
        if(currentChatRes.success){
            currentChat = currentChatRes.data 
        }
    }
    
    return (
        <ChatScreen allChatsSSR={allChats} currentChatSSR={currentChat} />
    )
}



