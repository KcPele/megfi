"use client";

import { motion } from 'framer-motion';
import { 
  Bitcoin, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  ArrowLeft,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { useActors } from '@/hooks/useActors';
import { useAuth } from '@/providers/auth-provider';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export function AccountOverview() {
  const { mainCanister } = useActors();
  const { identity } = useAuth();
  const [totalUsd, setTotalUsd] = useState<number>(0);
  const [borrowUsd, setBorrowUsd] = useState<number>(0);
  const [collateralCkbtc, setCollateralCkbtc] = useState<number>(0);
  const [ltv, setLtv] = useState<number>(0);
  const [maxLtv, setMaxLtv] = useState<number>(0);
  const [liqLtv, setLiqLtv] = useState<number>(0);
  const [healthFactor, setHealthFactor] = useState<number | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [btcUsd, setBtcUsd] = useState<number>(0);
  useEffect(() => {
    const run = async () => {
      try {
        const p = identity?.getPrincipal();
        if (!p) return;
        const [portfolio, pos, prices, cfg] = await Promise.all([
          (mainCanister as any).getPortfolio(p),
          (mainCanister as any).getPosition(),
          (mainCanister as any).getPrices(),
          (mainCanister as any).getProtocolConfig(),
        ]);
        setTotalUsd(Number(portfolio.total_usd_e8s) / 1e8);
        const debtUsdE8s = (Number(pos.debt_ckusdc) * 10_000_000) / 1_000_000; // 1e8/1e6
        const btcE8 = Number(prices.btc_usd_e8s);
        setBtcUsd(btcE8 / 1e8);
        const collateralUsdE8s = (Number(pos.collateral_ckbtc) * btcE8) / 1e8;
        setBorrowUsd(debtUsdE8s / 1e8);
        setCollateralCkbtc(Number(pos.collateral_ckbtc) / 1e8);
        const curLtv = collateralUsdE8s > 0 ? (debtUsdE8s / collateralUsdE8s) : 0;
        setLtv(curLtv);
        const max = Number(cfg.maxLTVBps) / 10000;
        const liq = Number(cfg.liquidationLTVBps) / 10000;
        setMaxLtv(max);
        setLiqLtv(liq);
        setHealthFactor(curLtv > 0 ? (liq / curLtv) : null);
      } catch (e) {
        console.error('Failed to load account overview', e);
      }
    };
    run();
  }, [identity, mainCanister]);
  
  const portfolioData: { name: string; value: number; color: string }[] = useMemo(() => {
    const collateralUsd = collateralCkbtc * btcUsd;
    const available = Math.max(collateralUsd * maxLtv - borrowUsd, 0);
    return [
      { name: 'ckBTC', value: Number(collateralUsd.toFixed(2)), color: 'hsl(var(--accent-yellow))' },
      { name: 'USDC Borrowed', value: Number(borrowUsd.toFixed(2)), color: 'hsl(var(--accent-teal))' },
      { name: 'Available', value: Number(available.toFixed(2)), color: 'hsl(var(--bg-tertiary))' },
    ];
  }, [collateralCkbtc, btcUsd, maxLtv, borrowUsd]);
  useEffect(() => {
    const run = async () => {
      try {
        const p = identity?.getPrincipal();
        if (!p) return;
        const res = await (mainCanister as any).getActivity(p);
        setActivities(Array.isArray(res) ? res.slice(0, 6) : []);
      } catch (e) {
        console.error('Failed to load recent activity', e);
      }
    };
    run();
  }, [identity, mainCanister]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-4 h-4 text-semantic-positive" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-semantic-warning" />;
      case 'danger':
        return <XCircle className="w-4 h-4 text-semantic-negative" />;
      default:
        return null;
    }
  };

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
        <h1 className="heading-large text-text-primary mb-2">Account Overview</h1>
        <p className="body-regular text-text-secondary">
          Monitor your portfolio, positions, and account health
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Portfolio Summary */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="card-container"
          >
            <h2 className="heading-medium text-text-primary mb-6">Portfolio Summary</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Chart */}
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={portfolioData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {portfolioData.map((entry: { name: string; value: number; color: string }, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="heading-large text-text-primary">${totalUsd.toFixed(2)}</p>
                      <p className="body-tiny text-text-muted">Total Value</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-4">
                <div className="card-mini">
                  <div className="flex items-center justify-between mb-2">
                    <span className="body-small text-text-muted">Net Worth</span>
                    <TrendingUp className="w-4 h-4 text-accent-mint" />
                  </div>
                  <p className="heading-medium text-text-primary">${(totalUsd - borrowUsd).toFixed(2)}</p>
                  <p className="metric-positive body-tiny mt-1">+$4.68 (13.6%)</p>
                </div>
                
                <div className="card-mini">
                  <div className="flex items-center justify-between mb-2">
                    <span className="body-small text-text-muted">Total Borrowed</span>
                    <DollarSign className="w-4 h-4 text-accent-teal" />
                  </div>
                  <p className="heading-medium text-text-primary">${borrowUsd.toFixed(2)}</p>
                  <p className="body-tiny text-text-secondary mt-1">4.5% APR</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Positions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="card-container"
          >
            <h2 className="heading-medium text-text-primary mb-4">Active Positions</h2>
            <div className="space-y-3">
              <div className="bg-bg-tertiary rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent-yellow/20 rounded-xl flex items-center justify-center">
                      <Bitcoin className="w-5 h-5 text-accent-yellow" />
                    </div>
                    <div>
                      <p className="body-regular font-medium text-text-primary">ckBTC Collateral</p>
                      <p className="body-tiny text-text-muted">{collateralCkbtc.toFixed(8)} ckBTC</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-bg-tertiary rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent-teal/20 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-accent-teal" />
                    </div>
                    <div>
                      <p className="body-regular font-medium text-text-primary">ckUSDC Debt</p>
                      <p className="body-tiny text-text-muted">${borrowUsd.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="card-container"
          >
            <h2 className="heading-medium text-text-primary mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {activities.map((a: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between py-3 border-b border-white/[0.05] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={'w-10 h-10 rounded-full flex items-center justify-center bg-accent-mint/20'}>
                      <DollarSign className="w-5 h-5 text-accent-mint" />
                    </div>
                    <div>
                      <p className="body-regular text-text-primary capitalize">
                        {String(a.kind).replace('_', ' ')} {String(a.token)}
                      </p>
                      <p className="body-tiny text-text-muted flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(Number(a.time) / 1_000_000).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="body-regular font-medium text-text-primary">
                      {(() => {
                        const token = String(a.token);
                        const decimals = token === 'ckBTC' ? 8 : token === 'ckUSDC' ? 6 : 0;
                        const n = Number(a.amount) / Math.pow(10, decimals);
                        return `${n.toFixed(decimals > 2 ? 4 : 2)} ${token}`;
                      })()}
                    </p>
                  </div>
                </div>
              ))}
              {activities.length === 0 && (
                <p className="body-small text-text-secondary">No recent activity</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {/* Position Health */}
          <div className="card-container">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-accent-mint" />
              <h3 className="heading-small text-text-primary">Position Health</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="body-small text-text-secondary">Collateral</span>
                <span className="body-regular font-semibold text-text-primary">{collateralCkbtc.toFixed(8)} ckBTC</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="body-small text-text-secondary">Debt</span>
                <span className="body-regular font-semibold text-text-primary">${borrowUsd.toFixed(2)} ckUSDC</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="body-small text-text-secondary">Current LTV</span>
                <span className="body-regular font-semibold text-text-primary">{(ltv * 100).toFixed(2)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="body-small text-text-secondary">Max LTV</span>
                <span className="body-regular font-semibold text-text-primary">{(maxLtv * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="body-small text-text-secondary">Liquidation LTV</span>
                <span className="body-regular font-semibold text-semantic-negative">{(liqLtv * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="body-small text-text-secondary">Health Factor</span>
                <span className={`body-regular font-semibold ${healthFactor && healthFactor > 1.2 ? 'text-semantic-positive' : 'text-semantic-warning'}`}>
                  {healthFactor ? healthFactor.toFixed(2) : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card-container">
            <h3 className="heading-small text-text-primary mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/deposit-btc" className="block">
                <button className="w-full py-3 px-4 bg-bg-tertiary hover:bg-white/10 rounded-xl text-text-primary font-medium transition-colors text-left">
                  Add Collateral
                </button>
              </Link>
              <Link to="/repay-loan" className="block">
                <button className="w-full py-3 px-4 bg-bg-tertiary hover:bg-white/10 rounded-xl text-text-primary font-medium transition-colors text-left">
                  Repay Loan
                </button>
              </Link>
              <button className="w-full py-3 px-4 bg-bg-tertiary hover:bg-white/10 rounded-xl text-text-primary font-medium transition-colors text-left">
                Export Report
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
