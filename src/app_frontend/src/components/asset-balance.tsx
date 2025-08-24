import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useActors } from "@/hooks/useActors";
import { useAuth } from "@/providers/auth-provider";

interface AssetBalanceProps {
  symbol: string;
}

export function AssetBalance({ symbol }: AssetBalanceProps) {
  const { mainCanister } = useActors();
  const { identity } = useAuth();
  const [balance, setBalance] = useState(0);
  const [usdValue, setUsdValue] = useState(0);
  const [locked, setLocked] = useState(0);

  useEffect(() => {
    const run = async () => {
      try {
        if (!identity) return;
        const principal = identity.getPrincipal();
        const portfolio = await (mainCanister as any).getPortfolio(principal);
        const prices = await (mainCanister as any).getPrices();

        if (symbol === "USDC") {
          const amt = Number(portfolio.ckusdc || 0) / 1e6;
          setBalance(amt);
          const price = Number(prices.usdc_usd_e6s || 1_000_000) / 1e6;
          setUsdValue(amt * price);
          setLocked(0);
        } else {
          // default to ckBTC
          const amt = Number(portfolio.ckbtc || 0) / 1e8;
          setBalance(amt);
          const price = Number(prices.btc_usd_e8s || 0) / 1e8;
          setUsdValue(amt * price);
          try {
            const pos = await (mainCanister as any).getPosition();
            setLocked(Number(pos?.collateral_ckbtc || 0) / 1e8);
          } catch {}
        }
      } catch (e) {
        console.error("Failed to load asset balance", e);
      }
    };
    run();
  }, [identity, mainCanister, symbol]);

  const change24h: number | null = null; // not provided by backend yet
  const isPositive = (change24h ?? 0) > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center mb-8 mt-6"
    >
      {/* Main Balance */}
      <div className="mb-6">
        <h2 className="text-4xl font-bold mb-2">
          {balance.toLocaleString()} {symbol}
        </h2>
        <div className="flex items-center justify-center gap-3">
          <p className="text-xl text-muted-foreground">
            ${usdValue.toLocaleString()}
          </p>
          {change24h === null ? null : (
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                isPositive ? "text-accent-mint" : "text-accent-pink"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{Math.abs(change24h)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Available Balance Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="inline-flex items-center gap-3 bg-bg-secondary/50 backdrop-blur-sm border border-accent-mint/10 rounded-xl px-6 py-4"
      >
        <div className="text-left">
          <p className="text-sm text-muted-foreground mb-1">
            Available Balance
          </p>
          <p className="text-2xl font-semibold">{balance.toLocaleString()}</p>
        </div>
        <div className="h-12 w-px bg-accent-mint/20" />
        <div className="text-left">
          <p className="text-sm text-muted-foreground mb-1">Locked</p>
          <p className="text-2xl font-semibold">{locked.toLocaleString()}</p>
        </div>
        <div className="relative group">
          <Info className="w-4 h-4 text-muted-foreground cursor-help" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-bg-tertiary rounded-lg text-xs sm:whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Locked balance includes staked and collateralized assets
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
