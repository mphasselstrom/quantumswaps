function ErrorDisplay({ error }: { error: string | null | undefined }) {
  if (!error) return null;

  return (
    <div className="bg-red-900/20 border border-red-700 rounded-lg p-3 text-red-400 text-sm">
      {error}
    </div>
  );
}

export default ErrorDisplay;
