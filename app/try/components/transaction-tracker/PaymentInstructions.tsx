import { Currency } from '../../types';

function PaymentInstructions({
  fromAmount,
  fromCurrency,
  depositAddress,
  depositExtraId,
}: {
  fromAmount: string;
  fromCurrency: string | null;
  depositAddress: string;
  depositExtraId?: string;
}) {
  return (
    <div className="bg-indigo-900/30 rounded-lg p-3 border border-indigo-700 mt-2">
      <h3 className="text-indigo-300 font-medium mb-2">
        Send Payment Instructions
      </h3>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-slate-400">Send Exactly:</span>
          <span className="text-slate-300 font-medium">
            {fromAmount} {fromCurrency?.toLocaleUpperCase()}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block mb-1">Deposit Address:</span>
          <div className="bg-slate-800 p-2 rounded break-all font-mono text-xs text-slate-300">
            {depositAddress}
          </div>
        </div>
        {depositExtraId && (
          <div>
            <span className="text-slate-400 block mb-1">Extra ID:</span>
            <div className="bg-slate-800 p-2 rounded break-all font-mono text-xs text-slate-300">
              {depositExtraId}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaymentInstructions;
