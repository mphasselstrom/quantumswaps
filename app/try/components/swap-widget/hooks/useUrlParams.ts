import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export function useUrlParams(transactionId?: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialTxId = searchParams.get('txId');

  useEffect(() => {
    if (transactionId && !searchParams.get('txId')) {
      const params = new URLSearchParams(searchParams);
      params.set('txId', transactionId);
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [transactionId, pathname, router, searchParams]);

  return { initialTxId };
}
