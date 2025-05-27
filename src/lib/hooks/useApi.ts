import { useState, useEffect, useCallback } from 'react';
import { ApiResponse } from '../api';

// Generic hook for API calls
export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiCall();
      
      if (response.success) {
        setData(response.data || null);
      } else {
        setError(response.message || 'An error occurred');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

// Hook for mutations (POST, PUT, DELETE)
export function useMutation<T, P = any>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (
    apiCall: (params: P) => Promise<ApiResponse<T>>
  ) => {
    return async (params: P): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiCall(params);
        
        if (response.success) {
          return response.data || null;
        } else {
          setError(response.message || 'An error occurred');
          return null;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    };
  }, []);

  return { mutate, loading, error };
}

// Pagination hook
export function usePagination<T>(
  apiCall: (page: number, limit: number) => Promise<ApiResponse<T[]>>,
  initialPage = 1,
  initialLimit = 10
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchData = useCallback(async (pageNum: number, limitNum: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiCall(pageNum, limitNum);
      
      if (response.success) {
        setData(response.data || []);
        setTotal(response.total || 0);
        setHasMore((response.data?.length || 0) === limitNum);
      } else {
        setError(response.message || 'An error occurred');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    fetchData(page, limit);
  }, [fetchData, page, limit]);

  const nextPage = useCallback(() => {
    if (hasMore) {
      setPage(prev => prev + 1);
    }
  }, [hasMore]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage(prev => prev - 1);
    }
  }, [page]);

  const goToPage = useCallback((pageNum: number) => {
    setPage(pageNum);
  }, []);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);

  const refetch = useCallback(() => {
    fetchData(page, limit);
  }, [fetchData, page, limit]);

  return {
    data,
    loading,
    error,
    page,
    limit,
    total,
    hasMore,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
    refetch
  };
}

// Search hook with debouncing
export function useSearch<T>(
  apiCall: (query: string) => Promise<ApiResponse<T[]>>,
  debounceMs = 300
) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiCall(query);
        
        if (response.success) {
          setResults(response.data || []);
        } else {
          setError(response.message || 'Search failed');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, apiCall, debounceMs]);

  return {
    query,
    setQuery,
    results,
    loading,
    error
  };
}
