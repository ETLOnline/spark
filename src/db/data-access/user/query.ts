import { eq } from "drizzle-orm";
import { db } from "../..";
import { InsertUser, usersTable } from "../../schema";

export async function CreateUser(data: InsertUser) {
    await db.insert(usersTable).values(data);
}

export async function SelectUserById(id: string) {
    return await db.query.usersTable.findFirst({
        where: eq(usersTable.external_auth_id, id)        
    });
}

export async function SelectUserByEmail(email: string) {
    return await db.query.usersTable.findFirst({
        where: eq(usersTable.email, email)    
    });
}

