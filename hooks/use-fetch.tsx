import { useState } from "react";
import { toast } from "sonner";

type FetchFunction<T, Args extends any[]> = (...args: Args) => Promise<T>;

const useFetch = <T, Args extends any[]>(cb: FetchFunction<T, Args>) => {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const fn = async (...args: Args) => {
    setLoading(true);
    setError(null);

    try {
      const response = await cb(...args);
      setData(response);
      setError(null);
    } catch (error: any) {
      setError(error);
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
};

export default useFetch;