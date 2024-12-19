import { and, eq } from "drizzle-orm";
import { db } from "../..";
import { userContactsTable, usersTable } from "../../schema";



export const CreateContact = async (user_id: string, contact_id: string) => {
    try{
        return await db.insert(userContactsTable).values({ user_id, contact_id,is_requested:1 });
    }catch(error : any){
        throw new Error(error.message);
    }
}

export const DeleteContact = async (user_id: string, contact_id: string) => {
    try{
        return await db.delete(userContactsTable).where(
            and(
                eq(userContactsTable.contact_id, contact_id),
                eq(userContactsTable.user_id, user_id)
            )
        );
    }catch(error:any){
        throw new Error(error.message);
    }
}

export const GetContacts = async (user_id: string) => {
    try{
        return await db.select().from(userContactsTable).where(eq(userContactsTable.user_id, user_id)).leftJoin(
            usersTable,
            eq(usersTable.id, userContactsTable.contact_id)
        ).all();
    }catch(error:any){
        throw new Error(error.message);
    }
}

export const GetContact = async (user_id: string, contact_id: string) => {
    try{
        const contact = await db.query.userContactsTable.findFirst({
            where: and(
                eq(userContactsTable.user_id, user_id),
                eq(userContactsTable.contact_id, contact_id)
            ),
            with:{
                contact: true,
                user: true
            }
        })
        return contact;
    }catch(error:any){
        throw new Error(error.message);
    }
}
