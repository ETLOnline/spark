import { SelectUser } from "../db/schema";
import { isUserChannelAdmin } from "./channelRoleHelper";
import { isUserAdmin } from "./helpers";


export const getSpaceRole = (spaceId:string, user:SelectUser)=>{
  const spaceUser = user.spaces?.find((su)=> su.space_id === spaceId)
  if(spaceUser){
    return spaceUser.role
  }
  return null
}

export const isUserSpaceAdmin = (spaceId:string, user:SelectUser)=>{
  const spaceRole = getSpaceRole(spaceId, user)
  if(spaceRole === "admin"){
    return true
  }

  return false
}

export const canControlSpace = (channelId:string, spaceId:string, user:SelectUser)=>{
  const isSpaceAdmin = isUserSpaceAdmin(spaceId, user)
  const isPlatformAdmin = isUserAdmin(user)
  const isChannelAdmin = isUserChannelAdmin(channelId, user)
  if(isSpaceAdmin || isPlatformAdmin || isChannelAdmin){
    return true
    
  }
  return false
}