import { Currency } from '../../types';
import { ChangeEvent, RefObject } from 'react';

interface CurrencyInputProps {
  currency: Currency | null;
  amount: string;
  inputRef: RefObject<HTMLInputElement>;
  onAmountChange: (value: string) => void;
  onCurrencySelect: () => void;
  label: string;
}

export function CurrencyInput({
  currency,
  amount,
  inputRef,
  onAmountChange,
  onCurrencySelect,
  label,
}: CurrencyInputProps) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <label className="text-sm text-slate-400 font-medium">{label}</label>
      </div>
      <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
        <div className="flex items-center justify-between">
          <button
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 py-1 px-3 rounded-full"
            onClick={onCurrencySelect}
          >
            {currency ? (
              <>
                <img
                  src={currency.imageUrl}
                  alt={currency.symbol}
                  className="w-5 h-5"
                  onError={e => {
                    (
                      e.target as HTMLImageElement
                    ).src = `https://placehold.co/20x20/6b21a8/ffffff?text=${currency.symbol.charAt(
                      0
                    )}`;
                  }}
                />
                <span className="text-slate-300">{currency.symbol}</span>
                <span className="text-slate-500 text-xs">
                  ({currency.networkName})
                </span>
              </>
            ) : (
              <span className="text-slate-300">Select</span>
            )}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-slate-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            className="w-1/2 text-right bg-transparent text-xl text-slate-200 focus:outline-none focus:ring-0 border-none"
            placeholder="0.0"
            value={amount}
            onChange={e => onAmountChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
