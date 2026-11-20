import { useCallback, useEffect, useRef, useState } from "react";

/** Carrega dados e expõe recarregar; ignora respostas antigas quando as dependências mudam. */
export function useLoad<T>(loader: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const call = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const reload = useCallback(async () => {
    const id = ++call.current;
    setLoading(true);
    try {
      const result = await loader();
      if (id === call.current) {
        setData(result);
        setError(null);
      }
    } catch (e) {
      if (id === call.current) setError((e as Error).message);
    } finally {
      if (id === call.current) setLoading(false);
    }
  }, deps);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, error, loading, reload, setData };
}
