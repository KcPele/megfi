import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useActors } from "@/hooks/useActors";
import { useAuth } from "@/providers/auth-provider";
import { Link } from "react-router-dom";
import {
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Bitcoin,
  DollarSign,
  Activity,
  PieChart,
} from "lucide-react";

export function Home() {
  const { mainCanister } = useActors();
  const { identity } = useAuth();
  const [portfolioUsd, setPortfolioUsd] = useState<number>(0);
  const [ckbtc, setCkbtc] = useState<number>(0);
  const [availableUsd, setAvailableUsd] = useState<number>(0);
  const [btcPrice, setBtcPrice] = useState<number>(0);
  const [icpPrice, setIcpPrice] = useState<number>(0);
  const [tvlUsd, setTvlUsd] = useState<number>(0);
  const [utilizationPct, setUtilizationPct] = useState<number>(0);
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        const p = identity?.getPrincipal();
        if (!p) return;
        const [portfolio, cfg, prices, stats] = await Promise.all([
          (mainCanister as any).getPortfolio(p),
          (mainCanister as any).getProtocolConfig(),
          (mainCanister as any).getPrices(),
          (mainCanister as any).getProtocolStats(),
        ]);
        const usd = Number(portfolio.total_usd_e8s) / 1e8;
        setPortfolioUsd(usd);
        const ckbtcAmt = Number(portfolio.ckbtc) / 1e8;
        setCkbtc(ckbtcAmt);
        const maxLTV = Number(cfg.maxLTVBps) / 10000; // 0-1
        // Available to borrow approximated by maxLTV of ckBTC USD value
        const ckbtcUsd =
          (Number(portfolio.ckbtc) / 1e8) * (Number(prices.btc_usd_e8s) / 1e8);
        setAvailableUsd(ckbtcUsd * maxLTV);
        setBtcPrice(Number(prices.btc_usd_e8s) / 1e8);
        setIcpPrice(Number(prices.icp_usd_e8s) / 1e8);
        setTvlUsd(Number(stats.tvl_usd_e8s) / 1e8);
        setUtilizationPct(Number(stats.utilization_bps) / 100);
      } catch (e) {
        console.error("Failed to load home metrics", e);
      }
    };
    run();
  }, [identity, mainCanister]);

  useEffect(() => {
    const run = async () => {
      try {
        const p = identity?.getPrincipal();
        if (!p) return;
        const res = await (mainCanister as any).getActivity(p);
        setActivities(Array.isArray(res) ? res.slice(0, 5) : []);
      } catch (e) {
        console.error("Failed to load recent activity", e);
      }
    };
    run();
  }, [identity, mainCanister]);

  const fmtKind = (k: string) => {
    switch (k) {
      case "deposit_collateral":
        return "Supplied Collateral";
      case "withdraw_collateral":
        return "Withdrew Collateral";
      case "borrow":
        return "Borrowed";
      case "repay":
        return "Repaid";
      default:
        return k;
    }
  };
  const fmtDate = (t: bigint) => {
    try {
      return new Date(Number(t) / 1_000_000).toLocaleString();
    } catch {
      return "";
    }
  };
  const fmtAmount = (a: bigint, token: string) => {
    const decimals = token === "ckBTC" ? 8 : token === "ckUSDC" ? 6 : 0;
    const n = Number(a) / Math.pow(10, decimals);
    return `${n.toFixed(decimals > 2 ? 4 : 2)} ${token}`;
  };
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={stagger}
      className="space-y-6"
    >
      {/* Hero Section */}
      <motion.section variants={fadeInUp} className="text-center py-8">
        <h1 className="heading-xl text-text-primary mb-4">Welcome to MegFi</h1>
        <p className="body-regular text-text-secondary max-w-2xl mx-auto">
          Bridge your Bitcoin to the Internet Computer and unlock DeFi
          opportunities with institutional-grade security
        </p>
      </motion.section>

      {/* Portfolio Overview Card */}
      <motion.div variants={fadeInUp} className="card-container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="heading-medium text-text-primary">
            Portfolio Overview
          </h2>
          <Link
            to="/account"
            className="text-accent-mint hover:text-accent-mint/80 transition-colors"
          >
            <span className="body-small">View Details →</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card-mini">
            <div className="flex items-center justify-between mb-2">
              <span className="body-small text-text-muted">Total Balance</span>
              <Wallet className="w-4 h-4 text-accent-mint" />
            </div>
            <p className="heading-large text-text-primary">
              ${portfolioUsd.toFixed(2)}
            </p>
            <p className="metric-positive body-tiny mt-1">
              +12.5% <span className="text-text-muted">24h</span>
            </p>
          </div>

          <div className="card-mini">
            <div className="flex items-center justify-between mb-2">
              <span className="body-small text-text-muted">BTC Holdings</span>
              <Bitcoin className="w-4 h-4 text-accent-yellow" />
            </div>
            <p className="heading-large text-text-primary">
              {ckbtc.toFixed(8)}
            </p>
            <p className="body-tiny text-text-secondary">
              ≈ ${(ckbtc * btcPrice).toFixed(2)}
            </p>
          </div>

          <div className="card-mini">
            <div className="flex items-center justify-between mb-2">
              <span className="body-small text-text-muted">
                Available to Borrow
              </span>
              <DollarSign className="w-4 h-4 text-accent-teal" />
            </div>
            <p className="heading-large text-text-primary">
              ${availableUsd.toFixed(2)}
            </p>
            <p className="body-tiny text-text-secondary">Based on max LTV</p>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.section variants={fadeInUp}>
        <h2 className="heading-medium text-text-primary mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/deposit">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="card-container flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent-mint/20 rounded-xl flex items-center justify-center">
                  <ArrowDownRight className="w-6 h-6 text-accent-mint" />
                </div>
                <div>
                  <h3 className="heading-small text-text-primary">
                    Deposit BTC
                  </h3>
                  <p className="body-small text-text-secondary">
                    Bridge Bitcoin to ckBTC
                  </p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-text-muted group-hover:text-accent-mint transition-colors" />
            </motion.div>
          </Link>

          <Link to="/borrow">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="card-container flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent-teal/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-accent-teal" />
                </div>
                <div>
                  <h3 className="heading-small text-text-primary">
                    Borrow USDC
                  </h3>
                  <p className="body-small text-text-secondary">
                    Use ckBTC as collateral
                  </p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-text-muted group-hover:text-accent-teal transition-colors" />
            </motion.div>
          </Link>
        </div>
      </motion.section>

      {/* Market Stats */}
      <motion.section variants={fadeInUp} className="card-container">
        <div className="flex items-center justify-between mb-6">
          <h2 className="heading-medium text-text-primary">Market Stats</h2>
          <Activity className="w-5 h-5 text-accent-mint" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="body-tiny text-text-muted mb-1">BTC Price</p>
            <p className="body-regular font-semibold text-text-primary">
              ${btcPrice.toLocaleString()}
            </p>
            <p className="metric-positive body-tiny mt-1">+2.4%</p>
          </div>
          <div>
            <p className="body-tiny text-text-muted mb-1">ICP Price</p>
            <p className="body-regular font-semibold text-text-primary">
              ${icpPrice.toFixed(2)}
            </p>
            <p className="metric-negative body-tiny mt-1">-1.2%</p>
          </div>
          <div>
            <p className="body-tiny text-text-muted mb-1">TVL</p>
            <p className="body-regular font-semibold text-text-primary">
              ${tvlUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
            <p className="body-tiny text-text-secondary mt-1">
              Total value locked
            </p>
          </div>
          <div>
            <p className="body-tiny text-text-muted mb-1">Utilization</p>
            <p className="body-regular font-semibold text-text-primary">
              {utilizationPct.toFixed(2)}%
            </p>
            <p className="body-tiny text-text-secondary mt-1">Borrowed / TVL</p>
          </div>
        </div>
      </motion.section>

      {/* Recent Activity */}
      <motion.section variants={fadeInUp} className="card-container mb-24">
        <div className="flex items-center justify-between mb-4">
          <h2 className="heading-medium text-text-primary">Recent Activity</h2>
          <Link
            to="/account"
            className="text-accent-mint hover:text-accent-mint/80 transition-colors"
          >
            <span className="body-small">View All →</span>
          </Link>
        </div>

        <div className="space-y-3">
          {activities.map((a, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-3 border-b border-white/[0.05]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent-mint/20 rounded-full flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-accent-mint" />
                </div>
                <div>
                  <p className="body-regular text-text-primary">
                    {fmtKind(String(a.kind))}
                  </p>
                  <p className="body-tiny text-text-muted">{fmtDate(a.time)}</p>
                </div>
              </div>
              <p className="body-regular font-semibold text-text-primary">
                {fmtAmount(a.amount, String(a.token))}
              </p>
            </div>
          ))}
          {activities.length === 0 && (
            <p className="body-small text-text-secondary">No recent activity</p>
          )}
        </div>
      </motion.section>
    </motion.div>
  );
}
