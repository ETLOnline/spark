import { ChatChannelPrefix, ChatChannelSalt } from "../constants"

const  ChatChannelHash = (channelId:string)=>{
    const channelHash = crypto.subtle.digest('SHA-256', new TextEncoder().encode(ChatChannelSalt + channelId))
    return `${ChatChannelPrefix}${channelHash}`
}

export default ChatChannelHash