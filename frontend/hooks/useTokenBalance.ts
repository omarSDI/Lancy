/**
 * Lansy.ai — Custom Hooks: useTokenBalance
 */

'use client';

import { useEffect, useCallback } from 'react';
import { useTokenStore } from '@/lib/store';
import { getTokenBalance } from '@/lib/api';

export function useTokenBalance() {
  const { balance, lifetimeUsed, isLoading, setBalance, optimisticDeduct, setLoading } =
    useTokenStore();

  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getTokenBalance();
      setBalance(data);
    } catch {
      // Error handled by API interceptor
      setLoading(false);
    }
  }, [setBalance, setLoading]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    lifetimeUsed,
    isLoading,
    refetch: fetchBalance,
    deduct: optimisticDeduct,
  };
}
