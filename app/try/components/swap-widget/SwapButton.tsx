interface SwapButtonProps {
  isLoading: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

export function SwapButton({
  isLoading,
  isDisabled,
  onClick,
}: SwapButtonProps) {
  return (
    <button
      className={`w-full py-3 px-4 rounded-lg transition duration-150 ease-in-out flex items-center justify-center ${
        isDisabled
          ? 'bg-purple-600/50 text-white/70 cursor-not-allowed'
          : 'bg-purple-600 text-white hover:bg-purple-700 cursor-pointer'
      }`}
      disabled={isDisabled}
      onClick={onClick}
    >
      {isLoading ? (
        <span className="flex items-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Getting Quote...
        </span>
      ) : (
        'Swap'
      )}
    </button>
  );
}
