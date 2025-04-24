'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Currency, CurrencySelectorProps } from '../types';

export default function CurrencySelector({
  isOpen,
  onClose,
  currencies,
  onSelect,
  title,
}: CurrencySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Currency[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const [visibleRangeStart, setVisibleRangeStart] = useState(0);

  const ITEMS_TO_RENDER = 200;

  const performLocalSearch = useCallback(
    (query: string) => {
      if (!query.trim() || !currencies || currencies.length === 0) {
        return [];
      }

      const searchTerms = query
        .toLowerCase()
        .split(/\s+/)
        .filter(term => term.length > 0);

      return currencies.filter(currency => {
        const name = currency.name.toLowerCase();
        const symbol = currency.symbol.toLowerCase();
        const network = currency.network.toLowerCase();

        return searchTerms.every(
          term =>
            name.includes(term) ||
            symbol.includes(term) ||
            network.includes(term)
        );
      });
    },
    [currencies]
  );

  const handleSearch = useCallback(
    (query: string) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      setSearchQuery(query);
      setVisibleRangeStart(0);

      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      searchTimeoutRef.current = setTimeout(() => {
        setIsSearching(true);
        try {
          const results = performLocalSearch(query);
          setSearchResults(results);
        } catch (error) {
          console.error('Error searching currencies:', error);
        } finally {
          setIsSearching(false);
        }
      }, 150);
    },
    [performLocalSearch]
  );

  const handleScroll = useCallback(() => {
    if (!listRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const bottomThreshold = 200;

    const currentDisplayLength = searchQuery.trim()
      ? searchResults.length
      : currencies?.length || 0;

    if (scrollHeight - scrollTop - clientHeight < bottomThreshold) {
      setVisibleRangeStart(prev =>
        Math.min(prev + 20, Math.max(0, currentDisplayLength - ITEMS_TO_RENDER))
      );
    }

    if (scrollTop < bottomThreshold && visibleRangeStart > 0) {
      setVisibleRangeStart(prev => Math.max(0, prev - 20));
    }
  }, [
    listRef,
    visibleRangeStart,
    ITEMS_TO_RENDER,
    searchQuery,
    searchResults,
    currencies,
  ]);

  useEffect(() => {
    const listElement = listRef.current;
    if (listElement) {
      listElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (listElement) {
        listElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [handleScroll]);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }

    setVisibleRangeStart(0);

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscapeKey);

    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
      setSearchQuery('');
      setSearchResults([]);
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [isOpen, onClose]);

  const handleModalClick = (e: React.MouseEvent) => {
    if (
      modalContentRef.current &&
      !modalContentRef.current.contains(e.target as Node)
    ) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const displayCurrencies = searchQuery.trim()
    ? searchResults
    : currencies || [];

  const sortedCurrencies = [...displayCurrencies].sort((a, b) => {
    const symbolCompare = a.symbol.localeCompare(b.symbol);
    if (symbolCompare !== 0) return symbolCompare;
    return (a.networkName || a.network).localeCompare(
      b.networkName || b.network
    );
  });

  const visibleCurrencies = sortedCurrencies.slice(
    visibleRangeStart,
    visibleRangeStart + ITEMS_TO_RENDER
  );

  const itemHeight = 64;
  const topSpacerHeight = visibleRangeStart * itemHeight;
  const bottomSpacerHeight = Math.max(
    0,
    (sortedCurrencies.length - visibleRangeStart - ITEMS_TO_RENDER) * itemHeight
  );

  if (displayCurrencies.length === 0 && !searchQuery.trim() && !isSearching) {
    return (
      <div
        className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center p-4 pt-32 overflow-y-auto"
        onClick={onClose}
      >
        <div
          ref={modalContentRef}
          className="bg-slate-800 rounded-xl max-w-md w-full max-h-[80vh] shadow-xl overflow-hidden"
        >
          <div className="p-4 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-800 z-10">
            <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
            <button
              className="text-slate-400 hover:text-slate-200 cursor-pointer"
              onClick={onClose}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className="p-8 text-center">
            <div className="text-slate-300 mb-4">No currencies available</div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-start justify-center p-4 pt-32 overflow-y-auto"
      onClick={handleModalClick}
    >
      <div
        ref={modalContentRef}
        className="bg-slate-800 rounded-xl max-w-md w-full max-h-[80vh] shadow-xl overflow-hidden"
      >
        <div className="p-4 border-b border-slate-700 flex justify-between items-center sticky top-0 bg-slate-800 z-10">
          <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
          <button
            className="text-slate-400 hover:text-slate-200 cursor-pointer"
            onClick={onClose}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className="p-4">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search by name, symbol or network"
            className="w-full bg-slate-900 rounded-lg border border-slate-700 px-4 py-2 mb-4 text-slate-200 focus:outline-none focus:border-purple-500"
            value={searchQuery}
            onChange={e => handleSearch(e.target.value)}
          />

          <div className="text-sm text-slate-400 mb-2">
            {searchQuery
              ? `Found ${displayCurrencies.length} currencies`
              : `${displayCurrencies.length} currencies available`}
          </div>

          <div
            ref={listRef}
            className="max-h-[50vh] overflow-y-auto pb-2 pr-1 currency-scroll relative"
          >
            {isSearching && (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500"></div>
                <span className="ml-2 text-slate-300">Searching...</span>
              </div>
            )}

            {!isSearching && sortedCurrencies.length > 0 ? (
              <div className="space-y-2 relative">
                {topSpacerHeight > 0 && (
                  <div style={{ height: `${topSpacerHeight}px` }} />
                )}

                {visibleCurrencies.map(currency => (
                  <button
                    key={currency.id}
                    className="w-full text-left p-3 hover:bg-slate-700 rounded-lg flex items-center transition duration-150 ease-in-out cursor-pointer"
                    onClick={() => onSelect(currency)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        {currency.imageUrl ? (
                          <img
                            src={currency.imageUrl}
                            alt={currency.symbol}
                            className="w-6 h-6 mr-3 rounded-full"
                            onError={e => {
                              (
                                e.target as HTMLImageElement
                              ).src = `https://placehold.co/24x24/6b21a8/ffffff?text=${currency.symbol.charAt(
                                0
                              )}`;
                            }}
                          />
                        ) : (
                          <div className="w-6 h-6 mr-3 rounded-full bg-purple-800 flex items-center justify-center text-white font-medium text-xs">
                            {currency.symbol.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="text-slate-200 font-medium">
                            {currency.name}
                          </div>
                          <div className="text-slate-400 text-sm">
                            {currency.symbol}
                          </div>
                        </div>
                      </div>
                      <div className="bg-slate-900 px-2 py-1 rounded-full text-xs text-slate-300">
                        {currency.networkName || currency.network}
                      </div>
                    </div>
                  </button>
                ))}

                {bottomSpacerHeight > 0 && (
                  <div style={{ height: `${bottomSpacerHeight}px` }} />
                )}
              </div>
            ) : (
              !isSearching &&
              searchQuery.trim() && (
                <div className="text-center text-slate-400 py-6">
                  No currencies found matching "{searchQuery}"
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
