'use server'

import { SelectUserByUniqueId } from "@/src/db/data-access/user/query";
import { CreateServerAction } from "..";

export const FindUserByUniqueIdAction = CreateServerAction(false, async (unique_id: string) => {
	try{
		const user = await SelectUserByUniqueId(unique_id);
		if (!user) {
			return { success: true , data : null }
		}
		return { success: true , data : user }
	}catch(error){
		return { error: error }
	}

})