import React, { useEffect, useRef, useState } from 'react';
import LazyLoad from 'react-lazyload';

interface AdProps {
  slot: string; // Accept slot ID as a prop
}

const Ad: React.FC<AdProps> = ({ slot }) => {
  const adRef = useRef<HTMLDivElement>(null);
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

  // Initialize the ad only if it hasn't been initialized
  useEffect(() => {
    if (!adBlocked && adRef.current) {
      const existingIns = adRef.current.querySelector('ins.adsbygoogle');

      // Only initialize the ad if it hasn't been initialized
      if (!existingIns) {
        const ins = document.createElement('ins');
        ins.className = 'adsbygoogle';
        ins.style.display = 'block';
        ins.setAttribute('data-ad-client', 'ca-pub-6959045179650835');
        ins.setAttribute('data-ad-slot', slot);
        ins.setAttribute('data-ad-format', 'auto');
        ins.setAttribute('data-full-width-responsive', 'true');

        adRef.current.appendChild(ins);

        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
          console.error('Adsense error:', e);
        }
      }
    }
  }, [adBlocked, slot]);

  return (
    <>
      {!adBlocked ? (
        <LazyLoad height={250} offset={100}>
          <div ref={adRef} style={{ margin: '20px 0', textAlign: 'center' }}></div>
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
