import PushNotifications from "@pusher/push-notifications-server"

export const beamsServerClient = new PushNotifications({
  instanceId: "2d067e20-10dc-428d-ac16-ae64858304f4",
  secretKey: "4258E8FF328D04F11718E88502193469E64970BECF94E90761EA1ED6ADCB859D"
})

export async function generateBeamsToken(userId: string) {
  if (!userId) throw new Error("Missing userId")
  return beamsServerClient.generateToken(userId)
}
