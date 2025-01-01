import { ChatScreen } from "@/src/components/oldDashboard/Chat";
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
    let selectedCurrectChatSlug = null

    const chatsRes = await GetUserChatsAction()
    if(chatsRes?.success && chatsRes?.data){
        allChats = chatsRes.data
    }

    if( allChats.length > 0  ){
        
        if(searchParams.active_chat){
            selectedCurrectChatSlug = searchParams.active_chat
        }else{
            selectedCurrectChatSlug = allChats[0].chat_slug
        }

        const currentChatRes = await GetChatBySlugWithMessagesAction(selectedCurrectChatSlug)
        if(currentChatRes.success){
            currentChat = currentChatRes.data 
        }
    }


    return (
        <ChatScreen allChatsSSR={allChats} currentChatSSR={currentChat} />
    )
}



