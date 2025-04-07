import { SelectUser } from "../db/schema";


export const getChannelRole = (channelId:string, user:SelectUser)=>{
    const channelUser = user.channels?.find((cu)=> cu.channel_id === channelId)
    if(channelUser){
        return channelUser.role
    }
    return null
}