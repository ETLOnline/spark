import * as Ably from 'ably';
// import { AblyProvider, ChannelProvider } from 'ably/react';
// import { config } from 'dotenv';

if (!process.env.ABLY_API_KEY) {
  throw new Error('ABLY_API_KEY is not defined in the environment variables');
}

export const AblyClient = new Ably.Realtime({ key: process.env.ABLY_API_KEY});
export const AblyClientRest = new Ably.Rest({ key: process.env.ABLY_API_KEY });



// export default function AblyChannelProviderWrapper({ children , channelName }: { children: React.ReactNode , channelName: string }) {
//     return (
//       <AblyProvider client={AblyClient}>
//         <ChannelProvider channelName={channelName}>
//           {children}
//         </ChannelProvider>
//       </AblyProvider>
//     );
//   }
