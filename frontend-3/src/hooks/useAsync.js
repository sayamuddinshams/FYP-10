import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Runs an async service call and exposes loading / error / data states.
 * fn must be a stable callback that returns a promise.
 */
export default function useAsync(fn, deps = [], options = {}) {
  const { immediate = true } = options;
  const [state, setState] = useState({ data: undefined, loading: immediate, error: null });
  const mounted = useRef(true);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fnRef.current();
      if (mounted.current) setState({ data, loading: false, error: null });
      return data;
    } catch (error) {
      if (mounted.current) setState({ data: undefined, loading: false, error: error?.message || 'Something went wrong. Please try again.' });
      return undefined;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (immediate) run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, immediate]);

  const setData = useCallback((updater) => {
    setState((prev) => ({ ...prev, data: typeof updater === 'function' ? updater(prev.data) : updater }));
  }, []);

  return { ...state, reload: run, setData };
}
