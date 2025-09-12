declare module "@mailchimp/mailchimp_transactional" {
  export default function MailchimpTransactional(apiKey: string): {
    messages: {
      send(payload: any): Promise<any>
      sendTemplate?(payload: any): Promise<any>
    }
  }
}
