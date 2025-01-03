import { useState } from 'react';

export function useServerAction<T, Args extends any[]>(
  callback: (...args: Args) => Promise<T>
) {
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const execute = async (...args: Args) => {
    setLoading(true)
    setError(null);
    try {
      const result = await callback(...args)
      setState(result)
      return result
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  return [ loading, state, error, execute ] as const;
}