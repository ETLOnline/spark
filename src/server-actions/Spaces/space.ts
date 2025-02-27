'use server'
import { CreateSpace } from "@/src/db/data-access/spaces/query";
import { CreateServerAction } from "..";
import { InsertSpace } from "@/src/db/schema";

export const CreateSpaceAction = CreateServerAction(true, async (SpaceData: InsertSpace)=>{
  try{
    const newSpace = await CreateSpace(SpaceData)
    return { success: true, data : newSpace }
  }catch(error){
    return {error:error}
  }
})