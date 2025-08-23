"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  ArrowLeft, 
  AlertTriangle, 
  TrendingUp,
  Shield,
  Clock,
  Info,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useActors } from '@/hooks/useActors';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/hooks/use-toast';
import { sanitizeDecimalInput } from '@/lib/utils';
import { canisterId as BACKEND_ID } from '@/../../declarations/app_backend';

export function RepayLoan() {
  const [amount, setAmount] = useState('');
  const [percentage, setPercentage] = useState(100);
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { ckbtcLedger, ckusdc, mainCanister } = useActors();
  const { identity } = useAuth();
  const { toast } = useToast();

  // Mock loan data
  const loanData = {
    outstanding: 21.00,
    interest: 0.95,
    total: 21.95,
    collateral: 0.0008,
    borrowDate: 'Nov 15, 2024',
    apr: '4.5%',
    daysActive: '45',
    healthFactor: '2.14'
  };

  const handleRepayment = async () => {
    if (!identity) {
      toast({ title: 'Not authenticated', description: 'Please sign in.' });
      return;
    }
    const repayStr = amount || repayAmount;
    if (!repayStr || Number(repayStr) <= 0) {
      toast({ title: 'Invalid amount', description: 'Enter a positive amount.' });
      return;
    }
    const toNat = (val: string, decimals: number): bigint => {
      const [w, f = ''] = val.split('.');
      const fp = (f + '0'.repeat(decimals)).slice(0, decimals);
      return BigInt(w || '0') * (10n ** BigInt(decimals)) + BigInt(fp || '0');
    };
    const repayNat = toNat(repayStr, 6);

    setLoading(true);
    try {
      // Approve backend to pull ckUSDC
      const approveRes = await ckusdc.icrc2_approve({
        fee: [],
        memo: [],
        from_subaccount: [],
        created_at_time: [],
        amount: repayNat,
        expected_allowance: [],
        expires_at: [],
        spender: { owner: BACKEND_ID as any, subaccount: [] },
      } as any);
      if ('Err' in approveRes) {
        toast({ title: 'Approve failed', description: JSON.stringify(approveRes.Err) });
        setLoading(false);
        return;
      }

      // Repay
      const repayRes = await (mainCanister as any).repayDebt(repayNat);
      if ('Err' in repayRes) {
        toast({ title: 'Repay failed', description: String(repayRes.Err) });
      } else {
        toast({ title: 'Repay succeeded', description: `Block index: ${String(repayRes.Ok)}` });
        setShowConfirmation(true);
      }
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Error', description: e?.message || 'Unexpected error' });
    } finally {
      setLoading(false);
    }
  };

  const repayAmount = (loanData.total * percentage / 100).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen"
    >
      {/* Page Header */}
      <div className="mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="body-small">Back to Dashboard</span>
        </Link>
        <h1 className="heading-large text-text-primary mb-2">Repay Loan</h1>
        <p className="body-regular text-text-secondary">
          Repay your USDC loan to release your ckBTC collateral
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Repayment Form */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="card-container"
          >
            {/* Amount Input */}
            <div className="mb-6">
              <label className="body-small text-text-muted mb-2 block">Repayment Amount</label>
              <div className="bg-bg-tertiary rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent-teal/20 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-accent-teal" />
                    </div>
                    <div>
                      <p className="body-regular font-medium text-text-primary">USDC</p>
                      <p className="body-tiny text-text-muted">USD Coin</p>
                    </div>
                  </div>
                  <input
                    inputMode="decimal"
                    value={amount || repayAmount}
                    onChange={(e) => setAmount(sanitizeDecimalInput(e.target.value, 6))}
                    placeholder="0.00"
                    className="bg-transparent text-right text-2xl font-semibold text-text-primary focus:outline-none w-40"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <p className="body-tiny text-text-muted">
                    Balance: $50.00 USDC
                  </p>
                  <p className="body-tiny text-text-secondary">
                    Total Due: ${loanData.total.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Percentage Selector */}
            <div className="mb-6">
              <label className="body-small text-text-muted mb-3 block">
                Repay Percentage ({percentage}%)
              </label>
              <div className="space-y-3">
                <input
                  type="range"
                  min="25"
                  max="100"
                  value={percentage}
                  onChange={(e) => setPercentage(Number(e.target.value))}
                  className="w-full h-2 bg-bg-tertiary rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, hsl(var(--accent-teal)) 0%, hsl(var(--accent-teal)) ${percentage}%, hsl(var(--bg-tertiary)) ${percentage}%, hsl(var(--bg-tertiary)) 100%)`
                  }}
                />
                <div className="flex justify-between">
                  {[25, 50, 75, 100].map((value) => (
                    <button
                      key={value}
                      onClick={() => setPercentage(value)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        percentage === value
                          ? 'bg-accent-teal text-text-inverse'
                          : 'bg-bg-tertiary text-text-secondary hover:bg-white/10'
                      }`}
                    >
                      {value}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Repayment Summary */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center py-3 border-b border-white/[0.05]">
                <span className="body-small text-text-secondary">Outstanding Loan</span>
                <span className="body-regular font-medium text-text-primary">
                  ${loanData.outstanding.toFixed(2)} USDC
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/[0.05]">
                <span className="body-small text-text-secondary">Interest Accrued</span>
                <span className="body-regular font-medium text-text-primary">
                  ${loanData.interest.toFixed(2)} USDC
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/[0.05]">
                <span className="body-small text-text-secondary">Total Due</span>
                <span className="body-regular font-semibold text-text-primary">
                  ${loanData.total.toFixed(2)} USDC
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="body-small text-text-secondary">Collateral to Release</span>
                <span className="body-regular font-medium text-semantic-positive">
                  {(loanData.collateral * percentage / 100).toFixed(8)} ckBTC
                </span>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleRepayment}
              disabled={loading}
              className={`w-full py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 bg-accent-teal text-text-inverse hover:bg-accent-teal/90`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Repay ${repayAmount} USDC</span>
              )}
            </button>
          </motion.div>

          {/* Info Box */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="card-container bg-accent-mint/10 border border-accent-mint/20 mt-6"
          >
            <div className="flex gap-3">
              <Info className="w-5 h-5 text-accent-mint flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="body-regular font-semibold text-text-primary mb-2">Good to Know</h4>
                <p className="body-small text-text-secondary">
                  Partial repayments are allowed. Your collateral will be released proportionally 
                  to the amount repaid. The remaining loan will continue to accrue interest.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Loan Details */}
          <div className="card-container">
            <h4 className="heading-small text-text-primary mb-4">Loan Details</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="body-small text-text-secondary">Borrow Date</span>
                <span className="body-small font-medium text-text-primary">{loanData.borrowDate}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="body-small text-text-secondary">APR</span>
                <span className="body-small font-medium text-accent-teal">{loanData.apr}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="body-small text-text-secondary">Days Active</span>
                <span className="body-small font-medium text-text-primary">{loanData.daysActive}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="body-small text-text-secondary">Health Factor</span>
                <span className="body-small font-medium text-semantic-positive">{loanData.healthFactor}</span>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="card-container">
            <h4 className="heading-small text-text-primary mb-4">Benefits of Repaying</h4>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-accent-mint/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-accent-mint" />
                </div>
                <div>
                  <p className="body-small font-medium text-text-primary">Release Collateral</p>
                  <p className="body-tiny text-text-secondary">Get back your locked ckBTC</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-accent-yellow/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-accent-yellow" />
                </div>
                <div>
                  <p className="body-small font-medium text-text-primary">Stop Interest</p>
                  <p className="body-tiny text-text-secondary">Save on growing costs</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-accent-teal/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-accent-teal" />
                </div>
                <div>
                  <p className="body-small font-medium text-text-primary">Improve History</p>
                  <p className="body-tiny text-text-secondary">Better borrowing record</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card-container max-w-md w-full"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-semantic-positive/20 rounded-full mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-semantic-positive" />
            </div>
            <h3 className="heading-medium text-text-primary text-center mb-2">Repayment Successful!</h3>
            <p className="body-regular text-text-secondary text-center mb-6">
              You've repaid ${repayAmount} USDC. Your collateral of {(loanData.collateral * percentage / 100).toFixed(8)} ckBTC 
              has been released to your wallet.
            </p>
            <button
              onClick={() => setShowConfirmation(false)}
              className="w-full py-3 rounded-xl bg-accent-mint text-text-inverse font-medium hover:bg-accent-mint/90 transition-colors"
            >
              Done
            </button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
