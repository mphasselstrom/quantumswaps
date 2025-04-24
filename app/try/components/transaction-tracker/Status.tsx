import { TransactionStatus } from '../../types';

function Status({ status }: { status: TransactionStatus }) {
  const getStatusStyles = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return 'bg-green-500/10 text-green-400 border-l-4 border-green-500';
      case TransactionStatus.PENDING:
        return 'bg-blue-500/10 text-blue-400 border-l-4 border-blue-500';
      case TransactionStatus.PAYOUT_CREATED:
        return 'bg-yellow-500/10 text-yellow-400 border-l-4 border-yellow-500';
      case TransactionStatus.FAILED:
        return 'bg-red-500/10 text-red-400 border-l-4 border-red-500';
      default:
        return 'bg-slate-500/10 text-slate-400 border-l-4 border-slate-500';
    }
  };

  const getStatusMessage = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.COMPLETED:
        return 'Transaction completed successfully';
      case TransactionStatus.PENDING:
        return 'Pending your payment to the deposit address';
      case TransactionStatus.PAYOUT_CREATED:
        return 'Payout created';
      case TransactionStatus.FAILED:
        return 'Transaction failed';
      default:
        return 'Transaction status unknown';
    }
  };
  return (
    <div className={`p-4 rounded ${getStatusStyles(status)}`}>
      <div className="flex items-center">
        <div
          className={`w-3 h-3 rounded-full mr-3 ${
            status === TransactionStatus.COMPLETED
              ? 'bg-green-400'
              : status === TransactionStatus.PENDING
              ? 'bg-blue-400'
              : status === TransactionStatus.PAYOUT_CREATED
              ? 'bg-yellow-400'
              : status === TransactionStatus.FAILED
              ? 'bg-red-400'
              : 'bg-slate-400'
          }`}
        />
        <div>
          <div className="text-sm font-medium capitalize">{status}</div>
          <div className="text-xs opacity-70">{getStatusMessage(status)}</div>
        </div>
      </div>
    </div>
  );
}

export default Status;
