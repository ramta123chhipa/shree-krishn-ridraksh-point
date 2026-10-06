import { useCallback, useEffect, useRef, useState } from 'react';

// Loads data when the page opens (and whenever `deps` change). Ignores answers that arrive late.
// Returns { data, loading, error, reload }.
export function useFetch(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const latest = useRef(0);

  const run = useCallback(() => {
    const id = ++latest.current;
    setState((s) => ({ ...s, loading: true, error: '' }));
    return fetcher()
      .then((data) => { if (id === latest.current) setState({ data, loading: false, error: '' }); })
      .catch((err) => { if (id === latest.current) setState((s) => ({ ...s, loading: false, error: err.message })); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { run(); return () => { latest.current += 1; }; }, [run]);
  return { ...state, reload: run };
}
