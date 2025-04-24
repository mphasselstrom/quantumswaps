import { Currency } from '../../types';

interface AddressInputProps {
  currency: Currency | null;
  address: string;
  onAddressChange: (value: string) => void;
  label: string;
  placeholder: string;
}

export function AddressInput({
  currency,
  address,
  onAddressChange,
  label,
  placeholder,
}: AddressInputProps) {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-2">
        <label className="text-sm text-slate-400 font-medium">{label}</label>
      </div>
      <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
        <input
          type="text"
          className="w-full bg-transparent text-sm text-slate-200 focus:outline-none focus:ring-0 border-none font-mono"
          placeholder={placeholder}
          value={address}
          onChange={e => onAddressChange(e.target.value)}
        />
      </div>
    </div>
  );
}
