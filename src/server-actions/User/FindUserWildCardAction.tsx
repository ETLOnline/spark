'use server'

import { CreateServerAction } from "..";
import { FindUserWildCard } from "@/src/db/data-access/user/query";


export const FindUserWildCardAction = CreateServerAction(true ,
    async (wildcard: string) => {
        try{
            const users = await FindUserWildCard(wildcard);
            return { success: true , data : users }
        }catch(error){
            return { error: error , data: null }
        }
    } 
)
