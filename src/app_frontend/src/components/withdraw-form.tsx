import { useState } from 'react';
import { cn, sanitizeDecimalInput, isValidEthAddress } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface WithdrawFormProps {
  symbol: string;
}

export function WithdrawForm({ symbol }: WithdrawFormProps) {
  const [percentage, setPercentage] = useState(100);
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const { toast } = useToast();
  
  const decimals = symbol.toLowerCase() === 'ckbtc' ? 8 : 6;
  const isAmountValid = amount !== '' && Number(amount) > 0;
  const isAddressValid = isValidEthAddress(address);
  const canSubmit = isAmountValid && isAddressValid;
  
  const stats = [
    { label: 'Price', value: '16%' },
    { label: 'Deposit APR', value: '16%' },
    { label: 'Your Borrow Limit', value: '700$' },
    { label: 'Utilization', value: '0.05%' },
  ];

  return (
    <div className="relative bg-gradient-to-b from-[#6366F1]/20 to-[#8B5CF6]/20 rounded-3xl p-6 backdrop-blur-xl">
      <div className="mb-8">
        <h3 className="text-2xl font-semibold mb-2">Withdraw</h3>
        <p className="text-gray-400">Enter how much {symbol} to withdraw</p>
      </div>

      <div className="bg-[#1A1B30]/80 rounded-xl p-4 mb-8">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Balance: 8098.74</span>
          <span>Deposited: 189.10</span>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(sanitizeDecimalInput(e.target.value, decimals))}
              placeholder={`0.${'0'.repeat(Math.min(4, decimals))}`}
              className="flex-1 bg-transparent text-right text-2xl font-semibold text-white focus:outline-none"
            />
            <span className="text-gray-400">{symbol}</span>
          </div>
          <input
            value={address}
            onChange={(e) => setAddress(e.target.value.trim())}
            placeholder="Recipient (0x...)"
            className={cn(
              "w-full bg-[#111226] text-white/90 rounded-xl px-4 py-3 text-sm focus:outline-none",
              !isAddressValid && address.length > 0 && "ring-1 ring-red-500"
            )}
          />
          {!isAddressValid && address.length > 0 && (
            <span className="text-xs text-red-400">Enter a valid Ethereum address (0x...)</span>
          )}
        </div>
      </div>

      <div className="flex gap-2 mb-8">
        {[10, 25, 50, 75, 100].map((value) => (
          <button
            key={value}
            onClick={() => setPercentage(value)}
            className={cn(
              "flex-1 py-3 rounded-xl text-sm font-medium transition-colors",
              percentage === value
                ? "bg-[#00A3FF] text-white"
                : "bg-[#1A1B30]/60 text-gray-400"
            )}
          >
            {value}%
          </button>
        ))}
      </div>

      <div className="space-y-3 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="flex justify-between text-sm">
            <span className="text-gray-400">{stat.label}</span>
            <span className="text-white">{stat.value}</span>
          </div>
        ))}
      </div>

      <button
        disabled={!canSubmit}
        onClick={() => {
          if (!canSubmit) {
            toast({ title: 'Invalid withdrawal', description: !isAmountValid ? 'Enter an amount greater than 0' : 'Enter a valid 0x address' });
            return;
          }
          toast({ title: 'Validated', description: `Withdrawing ${amount} ${symbol} to ${address}` });
        }}
        className={cn(
          "w-full py-3.5 rounded-xl font-medium transition-colors text-lg",
          canSubmit ? "bg-[#00A3FF] hover:bg-[#0093E9] text-white" : "bg-[#1A1B30]/60 text-gray-500 cursor-not-allowed"
        )}
      >
        Withdraw
      </button>
    </div>
  );
}
