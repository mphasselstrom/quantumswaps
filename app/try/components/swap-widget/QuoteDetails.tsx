import { Currency } from '../../types';
import { formatExpiryTime } from '../../utils/format';

interface QuoteDetailsProps {
  quoteData: any;
  fromCurrency: Currency | null;
  toCurrency: Currency | null;
  fromAmount: string;
}

export function QuoteDetails({
  quoteData,
  fromCurrency,
  toCurrency,
  fromAmount,
}: QuoteDetailsProps) {
  if (!quoteData) return null;

  return (
    <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
      <div className="flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">Rate</span>
          <div className="flex items-center">
            <div className="flex items-center mr-2">
              {fromCurrency?.imageUrl ? (
                <img
                  src={fromCurrency.imageUrl}
                  alt={fromCurrency.symbol}
                  className="w-4 h-4 mr-1"
                  onError={e => {
                    (
                      e.target as HTMLImageElement
                    ).src = `https://placehold.co/16x16/6b21a8/ffffff?text=${fromCurrency.symbol.charAt(
                      0
                    )}`;
                  }}
                />
              ) : (
                <div className="w-4 h-4 mr-1 rounded-full bg-purple-800 flex items-center justify-center text-white font-medium text-xs">
                  {fromCurrency?.symbol.charAt(0)}
                </div>
              )}
              <span className="text-slate-300 text-sm">
                1 {fromCurrency?.symbol}
              </span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-slate-500 mx-1"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
            <div className="flex items-center ml-1">
              {toCurrency?.imageUrl ? (
                <img
                  src={toCurrency.imageUrl}
                  alt={toCurrency.symbol}
                  className="w-4 h-4 mr-1"
                  onError={e => {
                    (
                      e.target as HTMLImageElement
                    ).src = `https://placehold.co/16x16/6b21a8/ffffff?text=${toCurrency.symbol.charAt(
                      0
                    )}`;
                  }}
                />
              ) : (
                <div className="w-4 h-4 mr-1 rounded-full bg-purple-800 flex items-center justify-center text-white font-medium text-xs">
                  {toCurrency?.symbol.charAt(0)}
                </div>
              )}
              <span className="text-slate-300 text-sm">
                {(
                  parseFloat(quoteData.toAmount) / parseFloat(fromAmount)
                ).toFixed(6)}{' '}
                {toCurrency?.symbol}
              </span>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">Network Fee</span>
          <span className="text-sm text-slate-300">
            {quoteData.networkFee} {fromCurrency?.symbol}
          </span>
        </div>
        {quoteData.expiry && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">Expires in</span>
            <span className="text-sm text-slate-300">
              {formatExpiryTime(quoteData.expiry)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
