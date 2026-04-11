'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchItems, createItem, updateItem, deleteItem } from '@/services/adminApiService';

interface UseAdminCrudResult<T> {
  items: T[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  create: (data: Partial<T>) => Promise<T>;
  update: (id: string, data: Partial<T>) => Promise<T>;
  remove: (id: string) => Promise<void>;
}

export function useAdminCrud<T extends { id: string }>(resource: string): UseAdminCrudResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchItems<T>(resource);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [resource]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const create = useCallback(
    async (data: Partial<T>): Promise<T> => {
      const newItem = await createItem<T>(resource, data);
      await refetch();
      return newItem;
    },
    [resource, refetch]
  );

  const update = useCallback(
    async (id: string, data: Partial<T>): Promise<T> => {
      const updated = await updateItem<T>(resource, id, data);
      await refetch();
      return updated;
    },
    [resource, refetch]
  );

  const remove = useCallback(
    async (id: string): Promise<void> => {
      await deleteItem(resource, id);
      await refetch();
    },
    [resource, refetch]
  );

  return { items, isLoading, error, refetch, create, update, remove };
}
