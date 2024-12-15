import { ColumnsSelection, eq, getTableColumns } from "drizzle-orm";
import { db } from "../..";
import { InsertUser, SelectUser, usersTable } from "../../schema";

export const userTableColSelect = {
    id: true,
    first_name: true,
    last_name: true,
    email: true,
    external_auth_id: true,
    profile_url: true,
    unique_id: true,
}

export async function CreateUser(data: InsertUser) {
    await db.insert(usersTable).values(data);
}

export async function SelectUserById(id: string) {
    return await db.query.usersTable.findFirst({
        columns: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            external_auth_id: true,
            profile_url: true,
            unique_id: true,
        },
        where: eq(usersTable.external_auth_id, id)        
    });
}

export async function SelectUserByEmail(email: string) {
    return await db.query.usersTable.findFirst({
        where: eq(usersTable.email, email)    
    });
}

export async function SelectUserByUniqueId(unique_id: string) {
    return await db.query.usersTable.findFirst({
        where: eq(usersTable.unique_id, unique_id)    
    });
}

