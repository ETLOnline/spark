import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { InsertUser } from '@/src/db/schema'
import { CreateUser, SelectUserByEmail, SelectUserById } from '@/src/db/data-access/user/query'

export async function POST(req: Request) {

  // You can find this in the Clerk Dashboard -> Webhooks -> choose the endpoint
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local')
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    })
  }

  // Do something with the payload
  // For this guide, you simply log the payload to the console
  // const { id } = evt.data;
  // const eventType = evt.type;

  // console.log(`Webhook with and ID of ${id} and type of ${eventType}`)
  // console.log('Webhook body:', body)

  if (evt.type === 'user.created') {
    const userObj = evt.data

		const userById = await SelectUserById(userObj.id)
		const userByEmail = await SelectUserByEmail(userObj.email_addresses[0].email_address)

		if (userById || userByEmail) {
			return new Response('', { status: 200 })
		}

    const newUser:InsertUser ={
      first_name: userObj.first_name || '',
      last_name: userObj.last_name || '',
      email: userObj.email_addresses[0].email_address || '',
      external_auth_id: userObj.id,
      profile_url: userObj.image_url || '',
      meta: JSON.stringify(userObj)
    } 
    await CreateUser(newUser)
  }

  return new Response('', { status: 200 })
}