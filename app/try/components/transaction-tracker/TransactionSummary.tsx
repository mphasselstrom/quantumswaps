import { Currency } from '../../types';

function TransactionSummary({
  fromAmount,
  fromCurrency,
  toAmount,
  toCurrency,
}: {
  fromAmount: string;
  fromCurrency: Currency | null;
  toAmount: string;
  toCurrency: Currency | null;
}) {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-between">
        <span className="text-slate-400">Send:</span>
        <span className="text-slate-300">
          {fromAmount} {fromCurrency?.symbol}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-400">Receive:</span>
        <span className="text-slate-300">
          {toAmount} {toCurrency?.symbol}
        </span>
      </div>
    </div>
  );
}

export default TransactionSummary;
