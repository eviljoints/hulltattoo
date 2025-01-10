// components/Ad.tsx

import React, { useEffect, useState } from 'react';
import AdSense from 'react-adsense';
import LazyLoad from 'react-lazyload';

const Ad = () => {
  const [adBlocked, setAdBlocked] = useState(false);

  // Detect if an ad blocker is active
  useEffect(() => {
    const testAd = document.createElement('div');
    testAd.innerHTML = '&nbsp;';
    testAd.className = 'adsbox';
    document.body.appendChild(testAd);
    window.setTimeout(() => {
      if (testAd.offsetHeight === 0) {
        setAdBlocked(true);
      }
      testAd.remove();
    }, 100);
  }, []);

  // Push ads to the AdSense queue after component mounts
  useEffect(() => {
    if (!adBlocked) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error('Adsense error:', e);
      }
    }
  }, [adBlocked]);

  return (
    <>
      {!adBlocked ? (
        <LazyLoad height={250} offset={100}>
          <div style={{ margin: '20px 0', textAlign: 'center' }}>
            <AdSense.Google
              client="ca-pub-6959045179650835" // Your AdSense client ID
              slot="9465374206" // Your AdSense slot ID
              style={{ display: 'block' }}
              format="auto"
              responsive="true"
            />
          </div>
        </LazyLoad>
      ) : (
        <div style={{ margin: '20px 0', textAlign: 'center', color: '#fff' }}>
          <p>Support us by disabling your ad blocker.</p>
        </div>
      )}
    </>
  );
};

export default Ad;
