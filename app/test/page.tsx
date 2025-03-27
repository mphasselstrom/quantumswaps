'use client';

import { useEffect } from 'react';

// Add type declaration for MoonPayWebSdk
declare global {
  interface Window {
    MoonPayWebSdk: {
      init: (config: any) => {
        show: () => void;
      };
    };
  }
}

export default function TestPage() {
  useEffect(() => {
    // Load MoonPay SDK
    const script = document.createElement('script');
    script.src = 'https://static.moonpay.com/web-sdk/v1/moonpay-web-sdk.min.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      const config = {
        apiKey: "pk_test_123",
        generalSettings: {
          enabledMethods: ['dex', 'mesh', 'moonpay-balance', 'fiat', 'onramper'],
          theme: 'light', // or 'dark'
          apiKey: 'pk_test_123',
          walletAddress: '0x1234567890123456789012345678901234567890',
          currencyCode: 'eth',
        },
        dexSettings: {
          fromToken: {
            chainName: 'ethereum',
            currencyCode: 'eth',
          },
          toToken: {
            chainName: 'ethereum',
            currencyCode: 'weth',
          },
          defaultAmount: 0.05
        },
        fiatSettings: {
          baseCurrencyAmount: 100,
          baseCurrencyCode: 'USD'
        }
      };

      // Initialize MoonPay SDK
      if (window.MoonPayWebSdk) {
        const moonpaySdk = window.MoonPayWebSdk.init({
          flow: "partnerTopup",
          environment: "sandbox",
          variant: "overlay",
          params: config
        });

        // Open widget
        moonpaySdk.show();
      }
    };

    return () => {
      // Cleanup script when component unmounts
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="container">
      {/* Empty container as requested in the HTML template */}
    </div>
  );
} 