'use server'

import { CreateContact, DeleteContact, GetContact, GetContacts } from "@/src/db/data-access/contact/query";
import { CreateServerAction } from "..";

export const CreateContactAction = CreateServerAction( true, async (user_id: string, contact_id: string) => {
    try{
        await CreateContact(user_id, contact_id);
        return { success: true }
    }catch(error){
        return { error: error }
    }
})

export const DeleteContactAction = CreateServerAction( true ,async (user_id: string, contact_id: string) => {
    try{
        await DeleteContact(user_id, contact_id);
        return { success: true }
    }catch(error){
        return { error: error }
    }
})

export const GetContactsAction = CreateServerAction( true , async (user_id: string) => {
    try{
        return await GetContacts(user_id);
    }catch(error){
        return { error: error }
    }
})

export const GetContactAction = CreateServerAction( true , async (user_id: string, contact_id: string) => {
    try{
        const contact = await GetContact(user_id, contact_id);
        return { success: true , data : contact };
    }catch(error){
        return { error: error , data: null }
    }
})
