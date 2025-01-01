'use server'

import { SelectUserByExternalId } from "@/src/db/data-access/user/query";
import { CreateServerAction } from "..";
import { auth } from "@clerk/nextjs/server";

export const AuthUserAction = CreateServerAction(false, async () => {
	try{
        const clerkUser = await auth();
		if (!clerkUser || !clerkUser.userId ) {
            throw new Error("Unauthorized", { cause: 401 });
		}
        const user = await SelectUserByExternalId(clerkUser.userId);
		return user
	}catch(error){
        throw new Error("Unauthorized", { cause: 401 });

	}

})