// hooks/useAdsRefresh.ts

import { useEffect } from 'react';
import { useRouter } from 'next/router';

const useAdsRefresh = () => {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = () => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('Adsense error:', e);
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);
};

export default useAdsRefresh;
