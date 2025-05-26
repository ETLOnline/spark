import { useState } from "react"

/**
 * A custom React hook for managing the state of an asynchronous server action.
 * It provides loading, result, and error states, along with an `execute` function
 * to trigger the action.
 *
 * @template T - The type of the result returned by the asynchronous action.
 * @template Args - The type of the arguments accepted by the callback function.
 *
 * @param callback - A function that performs an asynchronous operation and returns a Promise.
 *
 * @returns A tuple containing:
 * - `loading` (boolean): Indicates whether the action is currently in progress.
 * - `state` (T | null): The result of the action, or `null` if not yet completed.
 * - `error` (Error | null): The error encountered during the action, or `null` if none occurred.
 * - `execute` ((...args: Args) => Promise<T>): A function to trigger the asynchronous action.
 *
 * @example
 * ```tsx
 * const [loading, data, error, execute] = useServerAction(async (id: number) => {
 *   const response = await fetch(`/api/resource/${id}`);
 *   if (!response.ok) {
 *     throw new Error('Failed to fetch resource');
 *   }
 *   return await response.json();
 * });
 *
 * useEffect(() => {
 *   execute(1);
 * }, []);
 * ```
 */
export function useServerAction<T, Args extends any[]>(
  callback: (...args: Args) => Promise<T>
) {
  const [loading, setLoading] = useState(false)
  const [state, setState] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const execute = async (...args: Args) => {
    setLoading(true)
    setError(null)
    try {
      const result = await callback(...args)
      setState(result)
      return result
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  return [loading, state, error, execute] as const
}
