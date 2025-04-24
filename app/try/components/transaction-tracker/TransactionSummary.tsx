import { Currency } from '../../types';

function TransactionSummary({
  fromAmount,
  fromCurrency,
  toAmount,
  toCurrency,
}: {
  fromAmount: string;
  fromCurrency: string | null;
  toAmount: string;
  toCurrency: string | null;
}) {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between">
        <span className="text-slate-400">Send:</span>
        <span className="text-slate-300">
          {fromAmount} {fromCurrency?.toLocaleUpperCase()}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-400">Receive:</span>
        <span className="text-slate-300">
          {toAmount} {toCurrency?.toLocaleUpperCase()}
        </span>
      </div>
    </div>
  );
}

export default TransactionSummary;
