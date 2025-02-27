import { db } from "../.."
import { InsertSpace, spacesTable } from "../../schema"

export async function CreateSpace(spaceData: InsertSpace){
  try{
    const space = await db.insert(spacesTable).values(spaceData).returning()
    return space
  }catch(e:any){
    throw new Error(e.message)
  }
}