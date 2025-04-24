function TransactionId({ id }: { id: string }) {
  return (
    <div className="mt-4 mb-2">
      <span className="text-slate-400 block mb-1">Transaction ID:</span>
      <div className="bg-slate-800 p-3 rounded border border-slate-700 break-all font-mono text-sm text-slate-300">
        {id}
      </div>
    </div>
  );
}

export default TransactionId;
