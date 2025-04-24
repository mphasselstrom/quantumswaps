'use client';

import { useEffect, useState, useRef } from 'react';
import SwapWidget from './SwapWidget';
import CurrencySelector from './CurrencySelector';
import { useCurrencies } from '../hooks/useCurrencies';
import { Currency } from '../types';
import { useWallet } from '../context/WalletProvider';

export default function SwapPageContent() {
  const [fromModalOpen, setFromModalOpen] = useState(false);
  const [toModalOpen, setToModalOpen] = useState(false);

  const {
    connector,
    isConnecting,
    error: walletError,
    connect,
    disconnect,
  } = useWallet();

  const isConnected = connector?.isConnected || false;
  const userAccount = connector?.userAccount || '';

  const {
    fromCurrency,
    toCurrency,
    fromCurrencies,
    toCurrencies,
    isLoading,
    error,
    setFromCurrency,
    setToCurrency,
    loadCurrencies,
    swapCurrencies,
  } = useCurrencies();

  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      const initializeCurrencies = async () => {
        await loadCurrencies({
          toCurrency: 'eth',
          toNetwork: 'eth',
          fromCurrency: 'sol',
          fromNetwork: 'sol',
        });
      };
      initializeCurrencies();
    }
  }, [loadCurrencies]);

  const handleSelectFromCurrency = async (currency: Currency) => {
    setFromCurrency(currency);
    setFromModalOpen(false);
    await loadCurrencies({
      fromCurrency: currency.symbol.toLowerCase(),
      fromNetwork: currency.network,
    });
  };

  const handleSelectToCurrency = (currency: Currency) => {
    setToCurrency(currency);
    setToModalOpen(false);
  };

  return (
    <section className="relative">
      {/* Background gradient */}
      <div
        className="absolute inset-0 bg-slate-900 pointer-events-none -z-10"
        aria-hidden="true"
      >
        <div className="absolute bottom-0 left-0 right-0 h-full bg-slate-900 z-10"></div>
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none -z-10"
          aria-hidden="true"
        >
          <div className="absolute bottom-0 left-0 right-0 bg-linear-to-b from-slate-800/0 via-slate-800/50 to-slate-900 h-[25rem]"></div>
        </div>
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none -z-10"
          aria-hidden="true"
        >
          <div className="h-[40rem] w-[40rem] bg-slate-800 blur-[10rem] opacity-20 rounded-full"></div>
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="pt-32 pb-12 md:pt-40 md:pb-20">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center pb-12">
            <div className="inline-flex items-center justify-center p-1 mb-4 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
              <span className="bg-slate-900 rounded-full px-3 py-1 text-xs font-semibold text-slate-200">
                Swaps.xyz
              </span>
            </div>
          </div>

          {/* Wallet Connection Button */}
          <div className="max-w-lg mx-auto mb-6">
            {!isConnected ? (
              <button
                onClick={connect}
                disabled={isConnecting}
                className="w-full bg-slate-800 text-white font-bold py-3 px-4 rounded-lg border border-slate-700 hover:bg-slate-700 transition duration-150 ease-in-out flex items-center justify-center space-x-2 cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path
                    fillRule="evenodd"
                    d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
              </button>
            ) : (
              <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-slate-300">
                      {`${userAccount.slice(0, 6)}...${userAccount.slice(-4)}`}
                    </span>
                  </div>
                  <button
                    onClick={disconnect}
                    className="text-sm px-3 py-1 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition duration-150 ease-in-out cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="max-w-lg mx-auto p-6 text-center">
              <div className="animate-pulse">
                <div className="h-12 bg-slate-700 rounded-lg mb-4"></div>
                <div className="h-24 bg-slate-700 rounded-lg mb-4"></div>
                <div className="h-24 bg-slate-700 rounded-lg mb-4"></div>
              </div>
              <p className="text-slate-400 mt-4">Loading currencies...</p>
            </div>
          )}

          {/* Error state */}
          {(error || walletError) && (
            <div className="max-w-lg mx-auto p-6 bg-red-900/20 border border-red-700 rounded-lg text-center">
              <p className="text-red-400">
                Unexpected error occurred. Please try again.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700 transition duration-150 ease-in-out cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Swap Widget */}
          {!isLoading && !error && (
            <div className="max-w-lg mx-auto mt-6">
              <SwapWidget
                fromCurrency={fromCurrency}
                toCurrency={toCurrency}
                setFromModalOpen={setFromModalOpen}
                setToModalOpen={setToModalOpen}
                swapCurrencies={swapCurrencies}
              />
            </div>
          )}

          {/* Currency Modals */}
          {fromModalOpen && (
            <CurrencySelector
              isOpen={fromModalOpen}
              onClose={() => setFromModalOpen(false)}
              currencies={fromCurrencies}
              onSelect={handleSelectFromCurrency}
              title="Select From Token"
            />
          )}

          {toModalOpen && (
            <CurrencySelector
              isOpen={toModalOpen}
              onClose={() => setToModalOpen(false)}
              currencies={toCurrencies}
              onSelect={handleSelectToCurrency}
              title="Select To Token"
            />
          )}
        </div>
      </div>
    </section>
  );
}
