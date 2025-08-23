import { DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { useActors } from "@/hooks/useActors";
import { useAuth } from "@/providers/auth-provider";

type Activity = { owner: string; time: bigint; kind: string; amount: bigint; token: string; blockIndex: bigint };

export function TransactionHistory() {
  const { mainCanister } = useActors();
  const { identity } = useAuth();
  const [items, setItems] = useState<Activity[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        const p = identity?.getPrincipal();
        if (!p) return;
        const res = await (mainCanister as any).getActivity(p);
        setItems(Array.isArray(res) ? res : []);
      } catch (e) {
        console.error('Failed to load activity', e);
      }
    };
    run();
  }, [identity, mainCanister]);

  const fmtAmount = (a: bigint, token: string) => {
    const decimals = token === 'ckBTC' ? 8 : token === 'ckUSDC' ? 6 : 0;
    const n = Number(a) / Math.pow(10, decimals);
    return `${n.toFixed(decimals > 2 ? 4 : 2)} ${token}`;
  };

  const fmtKind = (k: string) => {
    switch (k) {
      case 'deposit_collateral': return 'Supply';
      case 'withdraw_collateral': return 'Withdraw';
      case 'borrow': return 'Borrow';
      case 'repay': return 'Repay';
      default: return k;
    }
  };

  const fmtDate = (t: bigint) => {
    try {
      const d = new Date(Number(t) / 1_000_000); // Time.now() in ns
      return d.toLocaleString();
    } catch {
      return '';
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">My transactions</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((it, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 glass-effect rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#2775CA] bg-opacity-20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#2775CA]" />
              </div>
              <div>
                <p className="font-medium">{fmtKind(String(it.kind))}</p>
                <p className="text-sm text-gray-400">{fmtDate(it.time)}</p>
              </div>
            </div>
            <p className="font-medium">{fmtAmount(it.amount, String(it.token))}</p>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        )}
      </div>
    </div>
  );
}
