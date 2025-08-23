"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Bitcoin, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useActors } from '@/hooks/useActors';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { sanitizeDecimalInput } from '@/lib/utils';
import { canisterId as BACKEND_ID } from '@/../../declarations/app_backend';

export function SupplyCollateral() {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { ckbtcLedger, mainCanister } = useActors();
  const { identity } = useAuth();
  const { toast } = useToast();

  const onSupply = async () => {
    if (!identity) {
      toast({ title: 'Not authenticated', description: 'Please sign in.' });
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast({ title: 'Invalid amount', description: 'Enter a positive ckBTC amount.' });
      return;
    }
    const toNat = (val: string, decimals: number): bigint => {
      const [w, f = ''] = val.split('.');
      const fp = (f + '0'.repeat(decimals)).slice(0, decimals);
      return BigInt(w || '0') * (10n ** BigInt(decimals)) + BigInt(fp || '0');
    };
    const amt = toNat(amount, 8);

    setLoading(true);
    try {
      // Approve backend as spender of ckBTC
      const approveRes = await ckbtcLedger.icrc2_approve({
        fee: [], memo: [], from_subaccount: [], created_at_time: [],
        amount: amt, expected_allowance: [], expires_at: [],
        spender: { owner: BACKEND_ID as any, subaccount: [] },
      } as any);
      if ('Err' in approveRes) {
        toast({ title: 'Approve failed', description: JSON.stringify(approveRes.Err) });
        setLoading(false);
        return;
      }

      // Deposit collateral
      const dep = await (mainCanister as any).depositCollateral(amt);
      if ('Err' in dep) {
        toast({ title: 'Deposit failed', description: String(dep.Err) });
      } else {
        toast({ title: 'Collateral supplied', description: `Block index: ${String(dep.Ok)}` });
      }
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error', description: e?.message || 'Unexpected error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen">
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="body-small">Back to Dashboard</span>
        </Link>
        <h1 className="heading-large text-text-primary mb-2">Supply Collateral</h1>
        <p className="body-regular text-text-secondary">Approve and deposit ckBTC as collateral</p>
      </div>

      <div className="card-container max-w-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-yellow/20 rounded-xl flex items-center justify-center">
              <Bitcoin className="w-5 h-5 text-accent-yellow" />
            </div>
            <div>
              <p className="body-regular font-medium text-text-primary">ckBTC</p>
              <p className="body-tiny text-text-muted">Bitcoin</p>
            </div>
          </div>
          <input
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(sanitizeDecimalInput(e.target.value, 8))}
            placeholder="0.0000"
            className="bg-transparent text-right text-2xl font-semibold text-text-primary focus:outline-none w-40"
          />
        </div>
        <button
          disabled={loading || !amount}
          onClick={onSupply}
          className={`mt-6 w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
            !amount ? 'bg-bg-tertiary text-text-muted cursor-not-allowed' : 'bg-accent-mint text-text-inverse hover:bg-accent-mint/90'
          }`}
        >
          {loading ? (<><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>) : 'Approve & Supply'}
        </button>
      </div>
    </motion.div>
  );
}

