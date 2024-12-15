'use server'

import { db } from "@/src/db";
import { eq, like } from "drizzle-orm";

export const FindUserWildCard = async (wildcard: string) => {
    try{
        const users = await db.query.usersTable.findMany({
            columns: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                external_auth_id: true,
                profile_url: true,
                unique_id: true,
            },
            where: (usersTable, { or }) => or(
                like(usersTable.first_name, `%${wildcard}%`),
                like(usersTable.last_name, wildcard),
                like(usersTable.email, wildcard),
            )
        });
        return { success: true , data : users }
    }catch(error){
        return { error: error , data: null }
    }
}