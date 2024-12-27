// import { auth } from "@clerk/nextjs/server"

export function CreateServerAction<T, Args extends any[]>(
  shouldCheckAuth: boolean,
  callback: (...args: Args) => Promise<T>
) {
  return async (...args: Args): Promise<T> => {
		// if (shouldCheckAuth) {
    //   const user = await auth();
    //   if (!user.userId) {
    //     throw new Error("Unauthorized", { cause: 401 });
    //   }
    // }
    return await callback(...args);
  };
}